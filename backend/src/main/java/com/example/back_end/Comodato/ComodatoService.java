package com.example.back_end.Comodato;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.back_end.Comodato.termos.ContextoTermo;
import com.example.back_end.Comodato.termos.TermoService;
import com.example.back_end.Comodato.termos.TipoTermoEnum;
import com.example.back_end.Infra.email.EmailService;
import com.example.back_end.PatrimonioEspecifico.EstadoEnum;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecificoRepository;
import com.example.back_end.PatrimonioEspecifico.service.PatrimonioEspecificoAuditService;
import com.example.back_end.Titular.domain.StatusPerfil;
import com.example.back_end.Titular.domain.Titular;
import com.example.back_end.Titular.repository.TitularRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ComodatoService {
    
    private final ComodatoRepository repository;
    private final PatrimonioEspecificoRepository patrepo;
    private final TitularRepository titularRepository;
    private final EmailService emailService;
    private final TermoService termoService;
    private final PatrimonioEspecificoAuditService auditService; // Injetando seu novo serviço centralizado
    private final ComodatoMapper mapper;

    public ComodatoService(
            ComodatoRepository repository,
            PatrimonioEspecificoRepository patrepo,
            TitularRepository titularRepository,
            EmailService emailService,
            TermoService termoService,
            PatrimonioEspecificoAuditService auditService,
            ComodatoMapper mapper) {
        this.repository = repository;
        this.patrepo = patrepo;
        this.titularRepository = titularRepository;
        this.emailService = emailService;
        this.termoService = termoService;
        this.auditService = auditService;
        this.mapper = mapper;
    }

    // Cadastrar
    @Transactional
    public Comodato salvar(ComodatoDto comodato) {

        Titular titular = titularRepository.findById(comodato.titularId())
                .orElseThrow(() -> new EntityNotFoundException("Titular não encontrado"));

        if(titular.getStatusPerfil() == StatusPerfil.INATIVO) {
            throw new IllegalStateException("Perfis inativos não podem fazer comodato.");
        }

        if (!titular.getTipoPerfil().permiteComodato()) {
            throw new IllegalStateException("Perfil do titular não permite comodato.");
        }

        List<PatrimonioEspecifico> patrimonios = patrepo.findAllById(comodato.patrimonioIds());

        if (patrimonios.size() != comodato.patrimonioIds().size()) {
            throw new EntityNotFoundException("Um ou mais patrimônios não encontrados.");
        }

        Comodato objeto = new Comodato();
        objeto.setDataInicio(comodato.dataInicio());
        objeto.setEstado(StatusEnum.ASSINATURA);
        objeto.setValidacaoTermo(false);
        objeto.setDataFimEsperado(comodato.dataFimEsperado());
        
        if (comodato.dataInicio().isAfter(comodato.dataFimEsperado())) {
            throw new IllegalArgumentException(
                    "A data de inicio do comodato não pode ser posterior a data de entrega esperada do equipamento.");
        }
        
        objeto.setTitular(titular);
        objeto.setTipoUso(titular.getTipoPerfil().tipoUsoPadrao());

        for (PatrimonioEspecifico patrimonio : patrimonios) {
            if (patrimonio.getComodato() != null &&
                    !patrimonio.getComodato().getEstado().isCancelado() &&
                    !patrimonio.getComodato().getEstado().isFinalizado()) {
                throw new IllegalStateException("Patrimônio já possui comodato em andamento.");
            }

            if (!patrimonio.getEstado().permiteComodato()) {
                throw new IllegalStateException("Patrimônio indisponível.");
            }

            patrimonio.setComodato(objeto);
        }

        objeto.setPatrimonios(patrimonios);
        patrepo.saveAll(patrimonios);

        String token = UUID.randomUUID().toString();
        objeto.setTokenAssinatura(token);
        objeto.setDataExpiracaoToken(LocalDateTime.now().plusHours(48));

        // Salva o comodato primeiro
        Comodato salvo = repository.save(objeto);

        // ⚡ REGISTRO DE AUDITORIA: Dispara o log de criação para cada patrimônio
        for (PatrimonioEspecifico patrimonio : salvo.getPatrimonios()) {
            auditService.registrarComodatoCriacao(patrimonio, titular.getNome());
        }

        emailService.enviarEmailComodato(
                titular.getEmail(),
                token,
                salvo);

        return salvo;
    }

    // para a assinatura do termo de Comodato
    @Transactional
    public Comodato validarToken(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Token inválido");
        }

        Comodato comodato = repository.findByTokenAssinatura(token)
                .orElseThrow(() -> new IllegalArgumentException("Token inválido"));

        if (!comodato.getEstado().aguardandoAssinatura()) {
            throw new IllegalStateException("Comodato não está aguardando assinatura.");
        }

        if (comodato.getDataExpiracaoToken().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Token expirado");
        }

        if (comodato.getDataAssinatura() != null) {
            throw new IllegalStateException("Termo já foi assinado.");
        }

        return comodato;
    }

    
    // aqui quando o termo de comodato foi assinado
    @Transactional
    public String assinar(String tokenAssinatura) {

        Comodato comodato = validarToken(tokenAssinatura);

        // 1. PRIMEIRO: Geramos o termo e fazemos o upload para pegar a URL
        var termoGerado = termoService.gerarSalvarEUpload(
                TipoTermoEnum.COMODATO,
                List.of(comodato.getUuid()),
                new ContextoTermo(null, null, "Termo assinado digitalmente."));

        // 2. SEGUNDO: Fazemos o loop nos patrimônios já com a URL em mãos
        for (PatrimonioEspecifico patrimonio : comodato.getPatrimonios()) {
            patrimonio.setComodato(comodato);
            patrimonio.setEstado(EstadoEnum.EMPRESTIMO);
            patrimonio.setEstadoFinalComodato("PENDENTE");
            patrimonio.setLocalizacao(null);
            
            // Opcional, mas recomendado: salva a nova URL no próprio patrimônio
            patrimonio.setTermoUrl(termoGerado.termo().getUrlPdf()); 
            
            // ⚡ REGISTRO DE AUDITORIA: Passando a URL fresquinha que acabamos de gerar
            auditService.registrarComodatoAssinatura(patrimonio, termoGerado.termo().getUrlPdf());
        }

        comodato.setDataAssinatura(LocalDateTime.now());
        this.definirEstadoComodato(comodato);
        comodato.setValidacaoTermo(true);
        comodato.setTokenAssinatura(null);
        comodato.setDataExpiracaoToken(null);

        repository.save(comodato);

        try {
            emailService.enviarCopiaTermoAssinado(
                comodato.getTitular().getEmail(), 
                termoGerado.bytes(), // Usando os bytes que geramos agora pouco!
                comodato
            );
        } catch (Exception e) {
            System.err.println("⚠️ Comodato assinado, mas e-mail não enviado: " + e.getMessage());
        }
        return termoGerado.termo().getUrlPdf();
    }

    public Page<Comodato> consultar(String termoBusca, StatusEnum estado, Pageable paginacao) {
        return repository.consultar(termoBusca, estado, paginacao);
    }

    public Page<Comodato> consultarAtivos(Pageable paginacao) {
        return repository.findByEstadoIn(
                List.of(StatusEnum.PENDENTE, StatusEnum.ATRASADO), paginacao);
    }

    @Transactional(readOnly = true)
    public Comodato consultarPorUuid(UUID uuid) {
        return repository.findById(uuid).orElseThrow(
                () -> new EntityNotFoundException("Comodato não encontrado: " + uuid));
    }

    @Transactional
    public Comodato atualizarEstado(UUID uuid, StatusEnum estado) {
        Comodato comodato = repository.findById(uuid).orElseThrow(
            ()-> new EntityNotFoundException("Comodato não encontrado:" + uuid));

        if(estado == null) {
            throw new IllegalStateException("Novo estado não informado.");
        }

        if (comodato.getEstado().isFinalizado()) {
            throw new IllegalStateException("Comodato finalizado não pode ter estado alterado.");
        }

        if(comodato.getEstado().isCancelado()) {
            throw new IllegalStateException("Comodato cancelado não pode ter estado alterado.");
        }

        // --- FLUXO DE CANCELAMENTO ---
        if(comodato.getEstado().aguardandoAssinatura()) {
            if(estado != StatusEnum.CANCELADO) {
                throw new IllegalStateException("Apenas comodatos aguardando assinatura podem ser cancelados.");
            }
            comodato.setEstado(StatusEnum.CANCELADO);
            comodato.setTokenAssinatura(null);
            comodato.setDataExpiracaoToken(null);
            comodato.setValidacaoTermo(false);

            for (PatrimonioEspecifico patrimonio : comodato.getPatrimonios()) {
                patrimonio.setEstado(EstadoEnum.GUARDADO);
                //Testando sem isso aqui
                //patrimonio.setComodato(null); // Importante limpar a referência

                // Usando seu novo AuditService (Limpo e direto!)
                auditService.registrarComodatoCancelamento(patrimonio, "Cancelado enquanto aguardava assinatura.");
            }

            return repository.save(comodato);
        }

        // --- FLUXO DE DEVOLUÇÃO ---
        if(comodato.getEstado().isAtivo()) {
            if(estado != StatusEnum.DEVOLVIDO) {
                throw new IllegalStateException("Comodatos ativos só podem ser finalizados como DEVOLVIDO."); 
                // repare que, se um equipamento em comodato foi extraviado, o estado deve ser editado no patrimonio, e o comodato consequentemente será dado comoo extraviado e finalizado
            }
            comodato.setEstado(StatusEnum.DEVOLVIDO);
            comodato.setDataFim(LocalDate.now(ZoneId.of("America/Rio_Branco")));
            
            for (PatrimonioEspecifico patrimonio : comodato.getPatrimonios()) {
                if (patrimonio.getEstado() == EstadoEnum.EXTRAVIADO) {
                    // Opcional: registrar em log que este item foi ignorado na devolução
                    patrimonio.setEstadoFinalComodato("EXTRAVIADO");
                    continue; 
                }
                patrimonio.setEstadoFinalComodato("DEVOLVIDO");
                patrimonio.setEstado(EstadoEnum.GUARDADO);
                patrimonio.setComodato(null);

                // Adicionando o log de devolução que faltava
                auditService.registrarComodatoDevolucao(patrimonio, "Equipamento devolvido e finalizado.");
            }
            
            patrepo.saveAll(comodato.getPatrimonios());
            return repository.save(comodato);
        }

        throw new IllegalStateException("Transição de estado inválida.");
    }

    @Transactional
    public void atualizarEstadoAuto(UUID uuid) {
        Comodato comodato = repository.findById(uuid).orElseThrow(
                () -> new EntityNotFoundException("Comodato inexistente"));

        if (comodato.getEstado().isFinalizado() || 
            comodato.getEstado().isCancelado() || 
            comodato.getEstado().isExtraviado()) { 
            return;
        }

        this.definirEstadoComodato(comodato);
    }

    // deletar - apenas em caso de comodato cancelado por erro de informação
    @Transactional
    public void deletar(UUID uuid) {
        Comodato comodato = repository.findById(uuid).orElseThrow(
                () -> new EntityNotFoundException("Comodato não encontrado"));

        if (!comodato.getEstado().isCancelado()) {
            throw new IllegalStateException("Este comodato não pode ser apagado, apenas comodatos cancelados permitem exclusão.");
        }

        // ⚡ Limpa referência nos patrimônios E salva o log de deleção
        for (PatrimonioEspecifico patrimonio : comodato.getPatrimonios()) {

            // Usando seu novo serviço para registrar a exclusão
            auditService.registrarComodatoDelecao(patrimonio, "Comodato cancelado foi excluído definitivamente do sistema.");

            //Agora tirando
            patrimonio.setComodato(null);
            
            
            
        }
        // Garante que o banco atualizou as FKs para nulo nos patrimônios ANTES de apagar o comodato
        patrepo.saveAll(comodato.getPatrimonios());

        repository.delete(comodato);
    }



    // metodo auxiliar pra verificação das datas + status do comodato
    public void definirEstadoComodato(Comodato comodato) {
        if (comodato.getEstado().isFinalizado() || 
            comodato.getEstado().isCancelado() || 
            comodato.getEstado().isExtraviado()) {
            return;
        }
        if(comodato.getDataFimEsperado() != null) {
            LocalDate hoje = LocalDate.now(ZoneId.of("America/Rio_Branco"));

            if(comodato.getDataFimEsperado().isBefore(hoje)) {
                comodato.setEstado(StatusEnum.ATRASADO);
            } else {
                comodato.setEstado(StatusEnum.PENDENTE);
            }
        }
    }
}