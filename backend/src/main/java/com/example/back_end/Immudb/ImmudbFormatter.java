package com.example.back_end.Immudb;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class ImmudbFormatter {

    private final ObjectMapper objectMapper;

    public ImmudbFormatter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String formatarNomeTabela(String tabela) {
        return switch (tabela) {
            case "historico_patrimonios" -> "Patrimônio Específico";
            case "historico_patrimonios_geral" -> "Patrimônio Geral";
            case "historico_nota_fiscal" -> "Nota Fiscal";
            case "historico_localizacao" -> "Localização";
            case "historico_categoria" -> "Categoria";
            case "historico_usuarios" -> "Usuário";
            default -> "Sistema";
        };
    }

    public Object padronizarJsonDetalhes(String jsonRaw) {
        if (jsonRaw == null || jsonRaw.isBlank()) return null;

        try {
            Map<String, Object> mapOriginal = objectMapper.readValue(jsonRaw, Map.class);
            Map<String, Object> mapPadronizado = new HashMap<>();
            List<String> chavesJaProcessadas = new ArrayList<>();

            // Tratamento de _antigo / _novo
            for (String key : mapOriginal.keySet()) {
                if (key.endsWith("_antigo")) {
                    String baseKey = key.replace("_antigo", "");
                    String keyNovo = baseKey + "_novo";

                    if (mapOriginal.containsKey(keyNovo)) {
                        Map<String, Object> mudanca = new HashMap<>();
                        mudanca.put("de", mapOriginal.get(key));
                        mudanca.put("para", mapOriginal.get(keyNovo));
                        
                        mapPadronizado.put(baseKey, mudanca);
                        chavesJaProcessadas.add(key);
                        chavesJaProcessadas.add(keyNovo);
                    }
                }
            }

            // Tratamento genérico
            for (String key : mapOriginal.keySet()) {
                if (chavesJaProcessadas.contains(key)) continue;

                Object valor = mapOriginal.get(key);
                if (valor instanceof Map) {
                    mapPadronizado.put(key, normalizarSubMap((Map<String, Object>) valor));
                } else {
                    mapPadronizado.put(key, valor);
                }
            }
            return mapPadronizado;
        } catch (Exception e) {
            return jsonRaw;
        }
    }

    private Map<String, Object> normalizarSubMap(Map<String, Object> subMap) {
        Map<String, Object> subMapLimpo = new HashMap<>();
        boolean houveNormalizacao = false;

        for (String subKey : subMap.keySet()) {
            if (subKey.startsWith("de")) {
                subMapLimpo.put("de", subMap.get(subKey));
                houveNormalizacao = true;
            } else if (subKey.startsWith("para") || subKey.startsWith("novo")) {
                subMapLimpo.put("para", subMap.get(subKey));
                houveNormalizacao = true;
            } else {
                subMapLimpo.put(subKey, subMap.get(subKey));
            }
        }
        return houveNormalizacao ? subMapLimpo : subMap;
    }
}