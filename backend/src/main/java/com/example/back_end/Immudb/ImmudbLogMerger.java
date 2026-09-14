package com.example.back_end.Immudb;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class ImmudbLogMerger {

    public List<HistoricoDTO> unificarLogsRelacionados(List<HistoricoDTO> logsBrutos) {
        if (logsBrutos == null || logsBrutos.isEmpty()) return logsBrutos;

        // Ordena por ID decrescente para garantir consistência
        logsBrutos.sort((h1, h2) -> {
            try {
                return Long.valueOf(h2.id()).compareTo(Long.valueOf(h1.id()));
            } catch (Exception e) { return 0; }
        });

        List<HistoricoDTO> logsUnificados = new ArrayList<>();

        for (int i = 0; i < logsBrutos.size(); i++) {
            HistoricoDTO atual = logsBrutos.get(i);

            if (i + 1 < logsBrutos.size()) {
                HistoricoDTO proximo = logsBrutos.get(i + 1);

                if (saoParteDaMesmaTransacao(atual, proximo)) {
                    logsUnificados.add(criarLogUnificado(atual, proximo));
                    i++; // Pula o próximo pois já foi fundido
                    continue;
                }
            }
            logsUnificados.add(atual);
        }

        return logsUnificados;
    }

    private boolean saoParteDaMesmaTransacao(HistoricoDTO log1, HistoricoDTO log2) {
        return log1.usuarioResponsavel().equals(log2.usuarioResponsavel()) &&
               log1.acao().equals(log2.acao());
               // Adicionar lógica de tempo aqui se tiver timestamps precisos no futuro
    }

    private HistoricoDTO criarLogUnificado(HistoricoDTO recente, HistoricoDTO antigo) {
        Map<String, Object> detalhesFundidos = new HashMap<>();

        if (antigo.detalhes() instanceof Map) {
            detalhesFundidos.putAll((Map<String, Object>) antigo.detalhes());
        }
        if (recente.detalhes() instanceof Map) {
            detalhesFundidos.putAll((Map<String, Object>) recente.detalhes());
        }

        return new HistoricoDTO(
            recente.id(),
            recente.uuidEntidade(),
            "Patrimônio", // Nome unificado
            recente.acao(),
            detalhesFundidos,
            recente.usuarioResponsavel(),
            recente.dataHora()
        );
    }
}