package com.example.back_end.PatrimonioEspecifico;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.back_end.Categoria.CategoriaRepository;
import com.example.back_end.Comodato.Comodato;
import com.example.back_end.Comodato.ComodatoRepository;
import com.example.back_end.Comodato.ComodatoService;
import com.example.back_end.Comodato.StatusEnum;
import com.example.back_end.Comodato.termos.ContextoTermo;
import com.example.back_end.Comodato.termos.Termo;
import com.example.back_end.Comodato.termos.TermoRepository;
import com.example.back_end.Comodato.termos.TermoService;
import com.example.back_end.Comodato.termos.TipoTermoEnum;
import com.example.back_end.Infra.email.EmailService;
import com.example.back_end.PatrimonioEspecifico.Etiqueta.EtiquetaDto;
import com.example.back_end.PatrimonioEspecifico.service.PatrimonioEspecificoAuditService;
import com.example.back_end.PatrimonioEspecifico.service.PatrimonioEspecificoDiffService;
import com.example.back_end.PatrimonioEspecifico.service.PatrimonioEspecificoEtiquetaService;
import com.example.back_end.PatrimonioEspecifico.service.PatrimonioEspecificoMovementService;
import com.example.back_end.PatrimonioEspecifico.service.PatrimonioEspecificoSequenceService;
import com.example.back_end.PatrimonioEspecifico.service.PatrimonioEspecificoValidationService;
import com.example.back_end.PatrimonioGeral.PatGerUpdatePatEsp;
import com.example.back_end.PatrimonioGeral.PatrimonioGeral;
import com.example.back_end.PatrimonioGeral.PatrimonioGeralRepository;
import com.example.back_end.PatrimonioGeral.PatrimonioGeralService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityNotFoundException;

/**
 * Serviço principal de Patrimônio Específico.
 * Orquestra as operações usando serviços especializados.
 * 
 * Responsabilidades:
 * - Orquestrar fluxos de negócio
 * - Delegar operações específicas para serviços especializados
 * - Manter apenas lógica de alto nível
 */
@Service
public class PatrimonioEspecificoService {

    // ========== REPOSITÓRIOS ==========
    private final PatrimonioEspecificoRepository repository;
    private final PatrimonioGeralRepository gerepo;
    private final CategoriaRepository categoriaRepository;
    private final TermoRepository termoRepository;
    private final ComodatoRepository comodatoRepository;

    // ========== SERVIÇOS CORE ==========
    private final PatrimonioEspecificoMapper mapper;
    private final PatrimonioGeralService patrimonioGeralService;
    private final ComodatoService comodatoService;
    private final EmailService emailService;

    // ========== SERVIÇOS ESPECIALIZADOS ==========
    private final PatrimonioEspecificoSequenceService sequenceService;
    private final PatrimonioEspecificoValidationService validationService;
    private final PatrimonioEspecificoDiffService diffService;
    private final PatrimonioEspecificoAuditService auditService;
    private final PatrimonioEspecificoEtiquetaService etiquetaService;
    private final PatrimonioEspecificoMovementService movementService;

    // ========== OUTROS SERVIÇOS ==========
    private final TermoService termoService;
    private final ObjectMapper jacksonMapper;

    public PatrimonioEspecificoService(
            PatrimonioEspecificoRepository repository,
            PatrimonioEspecificoMapper mapper,
            PatrimonioGeralRepository gerepo,
            CategoriaRepository categoriaRepository,
            TermoRepository termoRepository,
            TermoService termoService,
            ObjectMapper jacksonMapper,
            PatrimonioEspecificoSequenceService sequenceService,
            PatrimonioEspecificoValidationService validationService,
            PatrimonioEspecificoDiffService diffService,
            PatrimonioEspecificoAuditService auditService,
            PatrimonioEspecificoEtiquetaService etiquetaService,
            PatrimonioEspecificoMovementService movementService,
            @Lazy PatrimonioGeralService patrimonioGeralService,
            ComodatoService comodatoService,
            ComodatoRepository comodatoRepository,
            EmailService emailService
    ) {
        this.repository = repository;
        this.mapper = mapper;
        this.gerepo = gerepo;
        this.categoriaRepository = categoriaRepository;
        this.termoRepository = termoRepository;
        this.termoService = termoService;
        this.jacksonMapper = jacksonMapper;
        this.sequenceService = sequenceService;
        this.validationService = validationService;
        this.diffService = diffService;
        this.auditService = auditService;
        this.etiquetaService = etiquetaService;
        this.movementService = movementService;
        this.patrimonioGeralService = patrimonioGeralService;
        this.comodatoService = comodatoService;
        this.comodatoRepository = comodatoRepository;
        this.emailService = emailService;
    }

    // ========== OPERAÇÕES CRUD ==========

   /**
     * Cria um novo patrimônio específico.
     */
    @Transactional
    public PatrimonioEspecificoDto criar(PatrimonioEspecifico objeto) {
        
        // 1. TRATAMENTO E VALIDAÇÃO DO NÚMERO DE SÉRIE
        if (objeto.getNumSerie() != null) {
            String serieTratada = objeto.getNumSerie().trim();
            if (serieTratada.isEmpty()) {
                objeto.setNumSerie(null);
            } else {
                objeto.setNumSerie(serieTratada);
                validationService.validarNumeroSerie(serieTratada); // Só valida se realmente existir
            }
        }

        // 2. NÚMERO SEQUENCIAL (Só gera se não tiver sido pré-gerado pelo processamento em lote)
        if (objeto.getNumPatrimonio() == null) {
            objeto.setNumPatrimonio(sequenceService.gerarNumPatrimonio());
        }

        // 3. CARREGA O PATRIMÔNIO GERAL (Se for o caso)
        if (objeto.getPatrimonioGeral() != null && objeto.getPatrimonioGeral().getUuid() != null) {
            PatrimonioGeral patrimonioGeral = gerepo
                    .findById(objeto.getPatrimonioGeral().getUuid())
                    .orElseThrow(() -> new RuntimeException("Patrimônio Geral não encontrado"));
            objeto.setPatrimonioGeral(patrimonioGeral);
        }

        // 4. REGRAS DE NEGÓCIO E PERSISTÊNCIA
        validationService.aplicarRegrasNegocio(objeto);
        PatrimonioEspecifico patrimonio = repository.save(objeto);

        // 5. GERAÇÃO DE ETIQUETA NO CLOUDINARY (Só chama a API se as URLs ainda não existirem)
        if (patrimonio.getEtiquetaUrlPreta() == null || patrimonio.getEtiquetaUrlBranca() == null) {
            etiquetaService.gerarESalvarEtiqueta(patrimonio);
        }

        // 6. AUDITORIA E RETORNO
        auditService.registrarCriacao(patrimonio);
        
        return mapper.toDto(patrimonio);
    }

    /**
     * Salva um patrimônio com regras de negócio aplicadas.
     */
    @Transactional
    public PatrimonioEspecificoDto salvar(PatrimonioEspecifico objeto) {
        validationService.aplicarRegrasNegocio(objeto);
        PatrimonioEspecifico patrimonio = repository.save(objeto);
        etiquetaService.gerarESalvarEtiqueta(patrimonio);
        return mapper.toDto(patrimonio);
    }

    /**
     * Atualiza um patrimônio com controle de mudanças via auditoria.
     */
    @Transactional
    public PatrimonioEspecifico atualizar(UUID uuid, UpdateResponse request) {
        // 1. Buscar patrimônio
        PatrimonioEspecifico patrimonio = repository.findById(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Patrimônio específico não encontrado: " + uuid));

        // 2. Validar se pode ser editado
        validationService.validarEdicao(patrimonio);

        // 3. Capturar estado anterior
        Map<String, Object> snapshotAntes = jacksonMapper.convertValue(mapper.toDto(patrimonio), Map.class);

        // 4. Atualizar número de série
        if (request.numSerie() != null && !request.numSerie().equals(patrimonio.getNumSerie())) {
            validationService.validarNumeroSerieUnico(request.numSerie().trim(), uuid);
            patrimonio.setNumSerie(request.numSerie().trim());
        }

        // 5. Processar mudanças de estado
        if (request.estado() != null) {
            processarMudancaDeEstado(patrimonio, request);
        }

        // 6. Atualizar PatrimonioGeral se fornecido
        if (request.patrimonio() != null) {
            atualizarPatrimonioGeral(patrimonio, request.patrimonio());
        }

        // 7. Aplicar regras de negócio
        validationService.aplicarRegrasNegocio(patrimonio);

        // 8. Salvar e capturar estado final
        PatrimonioEspecifico salvo = repository.save(patrimonio);
        repository.flush();

        Map<String, Object> snapshotDepois = jacksonMapper.convertValue(mapper.toDto(salvo), Map.class);

        // 9. Registrar auditoria se houver mudanças
        Map<String, Object> mudancas = diffService.gerarDiff(snapshotAntes, snapshotDepois);

        //Pra evitar de salvar a alteração quando for editado o estado
        if (patrimonio.getEstado() != EstadoEnum.DOACAO && patrimonio.getEstado() != EstadoEnum.EXTRAVIADO && patrimonio.getEstado() != EstadoEnum.BAIXA) {
            auditService.registrarEdicao(salvo, mudancas);
        }
        

        return salvo;
    }

    /**
     * Processa mudanças de estado (saídas, empréstimos, etc).
     */
    private void processarMudancaDeEstado(PatrimonioEspecifico patrimonio, UpdateResponse request) {
        EstadoEnum estadoAtual = patrimonio.getEstado();
        EstadoEnum novoEstado = request.estado();

        Comodato comodatoAtivo = null;
        if (estadoAtual == EstadoEnum.EMPRESTIMO) {
            // Você vai precisar criar este método no seu ComodatoRepository
            comodatoAtivo = comodatoRepository.findAtivoByPatrimonioUuid(patrimonio.getUuid())
                            .orElse(null);
        }
        if (List.of(EstadoEnum.EXTRAVIADO, EstadoEnum.DOACAO, EstadoEnum.BAIXA).contains(estadoAtual)) {
            if (novoEstado != estadoAtual) {
                throw new IllegalStateException("Patrimônio com status '" + estadoAtual + 
                    "' é um item de saída e não pode mais ter seu estado alterado.");
            }
            return; 
        }

        // 2. LÓGICA DE COMODATO (EXTRAVIO PARCIAL OU TOTAL)

        if (comodatoAtivo != null && novoEstado != EstadoEnum.EMPRESTIMO && novoEstado != EstadoEnum.EXTRAVIADO) {
            throw new IllegalStateException("Encerre o Comodato oficialmente antes de mudar o estado para " + novoEstado);
        }

        // 3. PROCESSAR GERAÇÃO DE TERMOS E AUDITORIA DE SAÍDA
        if (List.of(EstadoEnum.EXTRAVIADO, EstadoEnum.DOACAO, EstadoEnum.BAIXA).contains(novoEstado)) {
            String obsFinal = (request.contexto() != null && request.contexto().observacao() != null) 
                ? request.contexto().observacao() 
                : "Saída registrada via alteração de estado.";

            ContextoTermo contextoParaEnvio = (request.contexto() != null) 
                ? request.contexto() 
                : new ContextoTermo(null, null, obsFinal); 

            var termo = termoService.gerarSalvarEUpload(
                    converterParaTipoTermo(novoEstado),
                    List.of(patrimonio.getUuid()),
                    contextoParaEnvio 
            );
            
            patrimonio.setTermoUrl(termo.termo().getUrlPdf());
            auditService.registrarSaida(patrimonio, novoEstado.toString(), obsFinal, termo.termo().getUrlPdf());

            enviarNotificacaoSaida(patrimonio, novoEstado, termo.bytes());
        }

        // 4. VALIDAÇÕES FINAIS E ATUALIZAÇÃO
        if (comodatoAtivo != null && novoEstado == EstadoEnum.EXTRAVIADO) {
            // Verifica se restam outros itens no comodato antes de desvincular este
            boolean restamItensNoComodato = comodatoAtivo.getPatrimonios().stream()
                .anyMatch(p -> !p.getUuid().equals(patrimonio.getUuid()) 
                            && p.getEstado() == EstadoEnum.EMPRESTIMO);

            if (!restamItensNoComodato) {
                comodatoAtivo.setEstado(StatusEnum.EXTRAVIADO);
                comodatoAtivo.setDataFim(LocalDate.now(ZoneId.of("America/Rio_Branco")));
                comodatoRepository.save(comodatoAtivo);
            }
            
            // Remove o vínculo após a geração do termo
            patrimonio.setComodato(null); 
        }

        // 5. ATUALIZAÇÕES FINAIS
        if (novoEstado == EstadoEnum.EMPRESTIMO) {
            validationService.validarEmprestimo(patrimonio);
        }

        patrimonio.setEstado(novoEstado);
        validationService.limparReferenciasAoMudarEstado(patrimonio, novoEstado);
    }

    // ================= MÉTODOS DE LOTE (BATCH) =================
    
    @Transactional
    public List<PatrimonioEspecifico> preSalvarLote(List<PatrimonioEspecifico> lista) {
        // Valida e salva no banco APENAS para gerar os UUIDs (Super rápido)
        lista.forEach(validationService::aplicarRegrasNegocio);
        return repository.saveAll(lista); 
    }

    @Transactional
    public void finalizarLoteComAuditoria(List<PatrimonioEspecifico> lista) {
        // Atualiza as URLs no banco e dispara o ImmuDB
        repository.saveAll(lista); 
        lista.forEach(auditService::registrarCriacao);
    }

        /**
     * Método auxiliar para disparar o e-mail de saída (Extravio/Doação/Baixa)
     */
    private void enviarNotificacaoSaida(PatrimonioEspecifico patrimonio, EstadoEnum estado, byte[] pdfBytes) {
        try {
            // Se o patrimônio tinha um titular (estava em comodato), enviamos para ele.
            // Caso contrário, você pode decidir se envia para um e-mail de auditoria/admin.
            String destinatario = (patrimonio.getComodato() != null) 
                ? patrimonio.getComodato().getTitular().getEmail() 
                : "admin@sistema.com"; // E-mail padrão de backup

            emailService.enviarEmailNotificacaoSaida(destinatario, patrimonio, estado, pdfBytes);
        } catch (Exception e) {
            System.err.println("⚠️ Erro ao enviar e-mail de saída: " + e.getMessage());
        }
    }

   /**
     * Atualiza dados do PatrimonioGeral vinculado.
     */
    private void atualizarPatrimonioGeral(PatrimonioEspecifico patrimonio, PatGerUpdatePatEsp patReq) {
        PatrimonioGeral pg = patrimonio.getPatrimonioGeral();
        if (pg == null) return;

        PatrimonioGeral novosDados = new PatrimonioGeral();
        novosDados.setDescricao(patReq.descricao() != null ? patReq.descricao() : pg.getDescricao());
        novosDados.setDataAquisicao(patReq.dataAquisicao() != null ? patReq.dataAquisicao() : pg.getDataAquisicao());
        novosDados.setValorAquisicao(patReq.valorAquisicao() != null ? patReq.valorAquisicao() : pg.getValorAquisicao());

        UUID novaCategoriaId = (patReq.categoriaId() != null) ? patReq.categoriaId()
                : (pg.getCategoria() != null ? pg.getCategoria().getUuid() : null);
                
        // Pegamos o ID da nota atual para comparar
        UUID notaAtualId = pg.getNotaFiscal() != null ? pg.getNotaFiscal().getUuid() : null;
        
        // Só dispara a exceção se a pessoa enviou uma notaFiscalId E ela for diferente da atual
        if (patReq.notaFiscalId() != null && !patReq.notaFiscalId().equals(notaAtualId)) {
            validationService.validarEditNota(patrimonio);
        }

        UUID novaNotaFiscalId = (patReq.notaFiscalId() != null) ? patReq.notaFiscalId() : notaAtualId;

        PatrimonioGeral atualizado = patrimonioGeralService.atualizarPatrimonio(
                pg.getUuid(), novosDados, novaCategoriaId, novaNotaFiscalId
        );
        patrimonio.setPatrimonioGeral(atualizado);
    }

    /**
     * Converte EstadoEnum para TipoTermoEnum.
     */
    private TipoTermoEnum converterParaTipoTermo(EstadoEnum estado) {
        return switch (estado) {
            case EXTRAVIADO -> TipoTermoEnum.EXTRAVIO;
            case DOACAO -> TipoTermoEnum.DOACAO;
            default -> TipoTermoEnum.BAIXA;
        };
    }

    // ========== OPERAÇÕES DE CONSULTA ==========

    /**
     * Consulta patrimônios com filtros.
     */
    @Transactional(readOnly = true)
    public Page<PatrimonioEspecificoResponse> consultarPorFiltros(
            String categoria,
            EstadoEnum estado,
            String local,
            String termoBusca,
            Boolean possuiNota, // <-- Mudou para Boolean
            Pageable paginacao
    ) {
        Page<PatrimonioEspecifico> entidades = repository.findByFiltros(
                categoria, estado, local, termoBusca, possuiNota, paginacao
        );
        return entidades.map(mapper::toDtoo);
    }

    /**
     * Consulta um patrimônio por UUID.
     */
    @Transactional(readOnly = true)
    public PatrimonioEspecificoResponse consultarPorUuid(UUID uuid) {
        PatrimonioEspecifico patrimonio = repository.findById(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Patrimônio não encontrado"));

        String urlTermo = termoRepository.findFirstByReferenciaIdOrderByDataCriacaoDesc(uuid)
                .map(Termo::getUrlPdf)
                .orElse(null);

        return mapper.toDtooSemHistorico(patrimonio, urlTermo);
    }

    /**
     * Consulta pública via QR Code (Etiqueta)
     */
    @Transactional(readOnly = true)
    public PatrimonioPublicoDTO consultarPublicoPorUuid(UUID uuid) {
        PatrimonioEspecifico patrimonio = repository.findById(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Patrimônio não encontrado para leitura do QR Code."));

        PatrimonioGeral pg = patrimonio.getPatrimonioGeral();
        
        // Extraindo os dados com segurança (verificando nulos)
        String descricao = pg != null ? pg.getDescricao() : "Sem descrição";
        LocalDate dataAquisicao = pg != null ? pg.getDataAquisicao() : null;
        String categoriaNome = (pg != null && pg.getCategoria() != null) ? pg.getCategoria().getNome() : "Sem categoria";
        String localizacaoNome = patrimonio.getLocalizacao() != null ? patrimonio.getLocalizacao().getLocal() : "Sem localização";

        return new PatrimonioPublicoDTO(
            patrimonio.getNumPatrimonio(),
            descricao,
            patrimonio.getEstado(),
            categoriaNome,
            localizacaoNome,
            patrimonio.getNumSerie(),
            dataAquisicao
        );
    }

    public long contarItensPorNotaFiscal(UUID notaFiscalUuid) {
        return repository.countByNotaFiscalUuid(notaFiscalUuid);
    }

    // ========== OPERAÇÕES DE MOVIMENTAÇÃO ==========

    /**
     * Move vários patrimônios para novo local e status em operação em lote.
     */
    @Transactional
    public void movimentarVariosLocal(BulkMovementDTO dto) {
        movementService.movimentarVariosLocal(dto);
    }

    // ========== OPERAÇÕES COM ETIQUETAS ==========

    /**
     * Gera e salva uma etiqueta para um patrimônio.
     */
    @Transactional
    public EtiquetaDto gerarESalvarEtiqueta(UUID uuid) {
        return etiquetaService.gerarEtiqueta(uuid);
    }

    /**
     * Baixa o arquivo de etiqueta do Cloudinary.
     */
    @Transactional(readOnly = true)
    public byte[] baixarEtiqueta(UUID uuid, boolean isBranca) {
        return etiquetaService.baixarEtiqueta(uuid, isBranca);
    }

    /**
     * Retorna todas as URLs de etiquetas cadastradas.
     */
    @Transactional(readOnly = true)
    public List<String> retornarEtiquetas() {
        return etiquetaService.retornarTodasEtiquetas();
    }

    // ========== OPERAÇÕES DE DELEÇÃO ==========

    /**
     * Deleta um patrimônio com registro de auditoria.
     */
    @Transactional
    public void deletar(UUID uuid, ApagadoResponse objeto) {
        PatrimonioEspecifico patrimonio = repository.findById(uuid)
                .orElseThrow(() -> new EntityNotFoundException("patrimonio não encontrado"));

        if(objeto.observacao() == null || objeto.observacao().isBlank()) {
            throw new IllegalStateException("Você deve justificar o motivo da exclusão do patrimônio.");
        }
        

        repository.delete(patrimonio);

        // FORÇA O COMANDO SQL IR PARA O BANCO AGORA
        repository.flush();

        auditService.registrarDelecao(patrimonio, objeto.observacao());
    }
}
