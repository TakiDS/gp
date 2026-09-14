package com.example.back_end.Historico.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.back_end.Historico.domain.Historico;
import com.example.back_end.Historico.domain.TipoAcaoEnum;
import com.example.back_end.Historico.dto.HistoricoDto;
import com.example.back_end.Historico.mapper.HistoricoMapper;
import com.example.back_end.Historico.repository.HistoricoRepository;
import com.example.back_end.UsuarioSistema.domain.UsuarioSistema;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class HistoricoService {

    private final HistoricoRepository repository;
    private final HistoricoMapper mapper;
    private final ObjectMapper objectMapper;

    public HistoricoService(HistoricoRepository repository, HistoricoMapper mapper, ObjectMapper objectMapper) {
        this.repository = repository;
        this.mapper = mapper;
        this.objectMapper = objectMapper;
    }

    public List<HistoricoDto> getAll() {
        return repository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> obterLogsConsolidados(String uuidEspecifico, String uuidGeral) {
        List<String> ids = List.of(uuidEspecifico, uuidGeral);
        List<Historico> historicos = repository.findByIdEntidadeAfetadaInOrderByDataHoraDesc(ids);

        List<Map<String, Object>> todosOsLogs = new ArrayList<>();

        for (Historico h : historicos) {
            try {
                List<Map<String, Object>> logsDoRegistro = objectMapper.readValue(
                        h.getDetalhesJson(),
                        new TypeReference<List<Map<String, Object>>>() {
                }
                );
                todosOsLogs.addAll(logsDoRegistro);
            } catch (Exception e) {
                // Log de erro opcional
            }
        }

        // Ordena pela data para que a linha do tempo fique correta
        todosOsLogs.sort((a, b) -> b.get("data").toString().compareTo(a.get("data").toString()));

        return todosOsLogs;
    }

    // Dentro de HistoricoService.java
    public List<HistoricoDto> getHistoricoPorPatrimonio(String uuidEspecifico, String uuidGeral) {
        List<String> ids = List.of(uuidEspecifico, uuidGeral);
        return repository.findByIdEntidadeAfetadaInOrderByDataHoraDesc(ids)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Registra um histórico.
     *
     * @param uuidEntidade O ID do Patrimônio ou Titular (pode passar o
     * UUID.toString())
     */
    public void registrar(TipoAcaoEnum acao, String novaMensagem, String uuidEntidade) {
        // 1. Tenta achar o registro único para aquela entidade (Patrimônio)
        Historico historico = repository.findByIdEntidadeAfetada(uuidEntidade)
                .orElseGet(() -> {
                    Historico h = new Historico();
                    h.setIdEntidadeAfetada(uuidEntidade);
                    h.setDetalhesJson("[]"); // Inicializa como lista vazia
                    return h;
                });

        try {
            // 2. Converte o JSON atual para uma lista de Maps
            List<java.util.Map<String, Object>> logs = objectMapper.readValue(
                    historico.getDetalhesJson(),
                    new com.fasterxml.jackson.core.type.TypeReference<>() {
            }
            );

            // 3. Cria o novo evento de modificação
            java.util.Map<String, Object> novoEvento = new java.util.HashMap<>();
            novoEvento.put("data", LocalDateTime.now().toString());
            novoEvento.put("acao", acao.name());
            novoEvento.put("usuario", getUsuarioLogado() != null ? getUsuarioLogado().getNome() : "Sistema");
            novoEvento.put("descricao", novaMensagem);

            // 4. Adiciona no topo da lista (mais recente primeiro)
            logs.add(0, novoEvento);

            // 5. Salva a String atualizada no banco
            historico.setDetalhesJson(objectMapper.writeValueAsString(logs));
            historico.setTipoAcao(acao);
            historico.setDataHora(LocalDateTime.now());
            historico.setUsuarioResponsavel(getUsuarioLogado());

            repository.save(historico);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar histórico JSON", e);
        }
    }

    private UsuarioSistema getUsuarioLogado() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof UsuarioSistema) {
                return (UsuarioSistema) principal;
            }
        } catch (Exception e) {
            return null;
        }
        return null;
    }
}
