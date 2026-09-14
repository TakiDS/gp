package com.example.back_end.PatrimonioEspecifico.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.back_end.Localizacao.Localizacao;
import com.example.back_end.Localizacao.LocalizacaoRepository;
import com.example.back_end.PatrimonioEspecifico.BulkMovementDTO;
import com.example.back_end.PatrimonioEspecifico.EstadoEnum;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecificoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityNotFoundException;

/**
 * Serviço responsável por operações de movimentação de patrimônios.
 * Responsabilidade única: Gerenciar movimentos de localização e status em lote.
 */
@Service
public class PatrimonioEspecificoMovementService {

    private final PatrimonioEspecificoRepository repository;
    private final LocalizacaoRepository localizacaoRepository;
    private final PatrimonioEspecificoValidationService validationService;
    private final PatrimonioEspecificoDiffService diffService;
    private final PatrimonioEspecificoAuditService auditService;
    private final ObjectMapper jacksonMapper;

    public PatrimonioEspecificoMovementService(
            PatrimonioEspecificoRepository repository,
            LocalizacaoRepository localizacaoRepository,
            PatrimonioEspecificoValidationService validationService,
            PatrimonioEspecificoDiffService diffService,
            PatrimonioEspecificoAuditService auditService,
            ObjectMapper jacksonMapper
    ) {
        this.repository = repository;
        this.localizacaoRepository = localizacaoRepository;
        this.validationService = validationService;
        this.diffService = diffService;
        this.auditService = auditService;
        this.jacksonMapper = jacksonMapper;
    }

    /**
     * Move vários patrimônios para um novo local e status em uma operação em
     * lote. Registra cada mudança com auditoria completa.
     */
    @Transactional
    public void movimentarVariosLocal(BulkMovementDTO dto) {
        // Buscar destino uma única vez para otimizar
        Localizacao localDestino = localizacaoRepository.findById(dto.novoLocal())
                .orElseThrow(() -> new EntityNotFoundException("Localização de destino não encontrada"));

        List<PatrimonioEspecifico> patrimonios = repository.findAllById(dto.patrimonioIDS());

        if(patrimonios == null || patrimonios.isEmpty()) {
            throw new EntityNotFoundException("Algum dos patrimônios informados não existe.");
        }

        for(PatrimonioEspecifico p: patrimonios) {
            // Validações da sua colega
            if(p.getEstado() == EstadoEnum.BAIXA || p.getEstado() == EstadoEnum.DOACAO || p.getEstado() == EstadoEnum.EXTRAVIADO) {
                throw new IllegalStateException("Patrimônio " + p.getNumPatrimonio() + " não pode ser movimentado pois não está mais sob o domínio do Web Academy. Verifique.");
            }

            if (p.getEstado() == EstadoEnum.EMPRESTIMO && dto.novoStatus() != EstadoEnum.EXTRAVIADO) {
                throw new IllegalStateException("O patrimônio " + p.getNumPatrimonio() + " está em comodato e só pode ser setado como EXTRAVIADO.");
            }

            // Chama o método de movimentação passando a entidade já carregada
            movimentarPatrimonio(p, localDestino, dto);
        }
    }

    /**
     * Move um patrimônio individual para um novo local e status gerando LOG.
     * Agora recebe a entidade direta para otimizar as buscas no banco.
     */
    private void movimentarPatrimonio(PatrimonioEspecifico pat, Localizacao localDestino, BulkMovementDTO dto) {
        // 1. Snapshot ANTES para o historico
        Map<String, Object> snapshotAntes = jacksonMapper.convertValue(
                converterParaMap(pat),
                Map.class
        );

        // 2. Aplicar mudanças
        pat.setLocalizacao(localDestino);
        pat.setEstado(dto.novoStatus());

        // Aplicar regras de negócio
        validationService.aplicarRegrasNegocio(pat);

        // 3. Salvar
        PatrimonioEspecifico salvo = repository.save(pat);

        // 4. Snapshot DEPOIS
        Map<String, Object> snapshotDepois = jacksonMapper.convertValue(
                converterParaMap(salvo),
                Map.class
        );

        // 5. Gerar diff
        Map<String, Object> mudancas = diffService.gerarDiff(snapshotAntes, snapshotDepois);

        if (!mudancas.isEmpty()) {
            // 6. Registrar auditoria com observações do lote
            auditService.registrarMovimentacao(salvo, mudancas, dto.observacoes());
        }
    }

    /**
     * Converte um patrimônio para um Map simples para comparação. Extrai apenas
     * os campos relevantes.
     */
//     private Map<String, Object> converterParaMap(PatrimonioEspecifico patrimonio) {
//         return Map.of(
//                 "uuid", patrimonio.getUuid(),
//                 "numPatrimonio", patrimonio.getNumPatrimonio(),
//                 "estado", patrimonio.getEstado(),
//                 "localizacao", patrimonio.getLocalizacao() != null
//                         ? Map.of("uuid", patrimonio.getLocalizacao().getUuid(),
//                                 "nome", patrimonio.getLocalizacao().getLocal())
//                         : null,
//                 "comodato", patrimonio.getComodato() != null
//                         ? Map.of("uuid", patrimonio.getComodato().getUuid())
//                         : null
//         );
//     }
    //Usando  HashMap mesmo
    private Map<String, Object> converterParaMap(PatrimonioEspecifico patrimonio) {
        Map<String, Object> dados = new HashMap<>();

        // Usando Optional ou verificações simples para garantir que não quebre
        dados.put("uuid", patrimonio.getUuid());
        dados.put("numPatrimonio", patrimonio.getNumPatrimonio());
        dados.put("estado", patrimonio.getEstado());

        // Localização
        if (patrimonio.getLocalizacao() != null) {
            Map<String, Object> localMap = new HashMap<>();
            localMap.put("uuid", patrimonio.getLocalizacao().getUuid());
            localMap.put("nome", patrimonio.getLocalizacao().getLocal());
            dados.put("localizacao", localMap);
        } else {
            dados.put("localizacao", null); // HashMap aceita isso de boa
        }

        // Comodato
        if (patrimonio.getComodato() != null) {
            dados.put("comodato", Map.of("uuid", patrimonio.getComodato().getUuid()));
        } else {
            dados.put("comodato", null);
        }

        return dados;
    }
}
