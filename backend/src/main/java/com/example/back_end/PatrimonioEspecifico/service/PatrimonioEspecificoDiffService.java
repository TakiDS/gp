package com.example.back_end.PatrimonioEspecifico.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.stereotype.Service;

@Service
public class PatrimonioEspecificoDiffService {

    public Map<String, Object> gerarDiff(Map<String, Object> antes, Map<String, Object> depois) {
        Map<String, Object> diff = new HashMap<>();
        List<String> camposIgnorados = List.of("uuid", "dataCriacao", "dataAtualizacao", "etiquetaUrl", "id");

        depois.forEach((campo, valorNovo) -> {
            if (camposIgnorados.contains(campo)) return;

            Object valorAntigo = antes.get(campo);

            // 1. Tratamento para OBJETOS (Localização, Comodato, etc.)
            if (valorNovo instanceof Map || valorAntigo instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> mapaNovo = valorNovo instanceof Map ? (Map<String, Object>) valorNovo : null;
                @SuppressWarnings("unchecked")
                Map<String, Object> mapaAntigo = valorAntigo instanceof Map ? (Map<String, Object>) valorAntigo : null;

                Object idNovo = mapaNovo != null ? mapaNovo.getOrDefault("uuid", mapaNovo.get("id")) : null;
                Object idAntigo = mapaAntigo != null ? mapaAntigo.getOrDefault("uuid", mapaAntigo.get("id")) : null;

                if (!Objects.equals(idNovo, idAntigo)) {
                    Map<String, Object> detalhe = new HashMap<>();
                    // Agora extrairNomeAmigavel retorna um Map { "nome": "..." }
                    detalhe.put("de", mapaAntigo != null ? extrairNomeAmigavel(mapaAntigo) : null);
                    detalhe.put("para", mapaNovo != null ? extrairNomeAmigavel(mapaNovo) : null);
                    diff.put(campo, detalhe);
                } 
                else if (mapaNovo != null && mapaAntigo != null) {
                    Map<String, Object> subDiff = gerarDiff(mapaAntigo, mapaNovo);
                    if (!subDiff.isEmpty()) {
                        diff.put(campo, subDiff); 
                    }
                }
            }
            // 2. Tratamento Padrão para campos simples (EstadoEnum, String, etc.)
            else if (!Objects.equals(formatarValor(valorAntigo), formatarValor(valorNovo))) {
                Map<String, Object> detalhe = new HashMap<>();
                detalhe.put("de", valorAntigo);
                detalhe.put("para", valorNovo);
                diff.put(campo, detalhe);
            }
        });

        return diff;
    }

    private String formatarValor(Object valor) {
        return valor == null ? "" : String.valueOf(valor);
    }

    /**
     * Extrai o valor e encapsula em um Map para satisfazer o front-end.
     */
    private Object extrairNomeAmigavel(Map<String, Object> objeto) {
        String valorFinal = null;

        if (objeto.containsKey("local")) valorFinal = String.valueOf(objeto.get("local"));
        else if (objeto.containsKey("nome")) valorFinal = String.valueOf(objeto.get("nome"));
        else if (objeto.containsKey("descricao")) valorFinal = String.valueOf(objeto.get("descricao"));
        else if (objeto.containsKey("numero")) valorFinal = String.valueOf(objeto.get("numero"));
        else if (objeto.containsKey("numNota")) valorFinal = String.valueOf(objeto.get("numNota"));
        
        // Se encontrou um nome/local, retorna no formato de objeto que o front quer
        if (valorFinal != null) {
            return Map.of("nome", valorFinal);
        }

        return objeto; 
    }
}