package com.example.back_end.Infra.Gemini;

import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    @Value("${gemini.key}")
    private String GEMINI_KEY;

    private final RestTemplate restTemplate = new RestTemplate();

    public String buscarNoGemini(byte[] pdfBytes) {
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=" + GEMINI_KEY;
            
            String base64 = Base64.getEncoder().encodeToString(pdfBytes);

            Map<String, Object> body = Map.of(
                "contents", List.of(Map.of(
                    "parts", List.of(
                        Map.of("text", "Extraia apenas os 44 números da chave de acesso desta NF-e. Responda apenas os números, sem texto adicional."),
                        Map.of("inline_data", Map.of("mime_type", "application/pdf", "data", base64))
                    )
                ))
            );

            JsonNode res = restTemplate.postForObject(url, body, JsonNode.class);
            
            if (res == null) {
                log.warn("Gemini retornou resposta nula.");
                return null;
            }

            JsonNode candidates = res.path("candidates");
            if (candidates.isMissingNode() || candidates.isEmpty()) {
                log.warn("Gemini não encontrou candidatos na resposta (possível bloqueio ou erro de modelo).");
                return null;
            }

            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (parts.isMissingNode() || parts.isEmpty()) {
                return null;
            }

            String texto = parts.get(0).path("text").asText();
            
            return texto.replaceAll("\\D", "");

        } catch (Exception e) {
            log.error("Erro ao chamar o Gemini: {}", e.getMessage());
            return null;
        }
    }
}