package com.example.back_end.WebScrap; // Ajuste para o seu pacote

import java.nio.charset.StandardCharsets;
import java.net.URI;
import java.util.Base64;
import java.util.Collections;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class DanfeRapidaService {

    private static final Logger log = LoggerFactory.getLogger(DanfeRapidaService.class);
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String danfeApiUrl;

    public DanfeRapidaService(
            ObjectMapper objectMapper,
            @Value("${danfe.api.url:}") String danfeApiUrl) {
        this.objectMapper = objectMapper;
        this.danfeApiUrl = danfeApiUrl;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5_000);
        requestFactory.setReadTimeout(15_000);
        this.restTemplate = new RestTemplate(requestFactory);
    }

    public DanfeResponse buscarXmlPelaChave(String chaveAcesso) {
        try {
            validateEndpoint();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

            String jsonBody = "{\"chaveAcesso\":\"" + chaveAcesso + "\"}";
            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

            log.info(">>> Solicitando Danfe para a chave: {} via Microserviço Python", chaveAcesso);

            // Se o Python retornar 500, o RestTemplate lança uma HttpStatusCodeException aqui mesmo
            ResponseEntity<String> response = restTemplate.postForEntity(danfeApiUrl, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                // Lê a resposta maravilhosa do nosso Python {"xml": "...", "base64": "..."}
                JsonNode root = objectMapper.readTree(response.getBody());
                String xmlString = root.path("xml").asText();
                String base64String = root.path("base64").asText();

                log.info(">>> SUCESSO! XML e PDF obtidos da API Python!");
                
                // Converte para byte[] para o resto do seu sistema usar
                byte[] xmlBytes = xmlString.getBytes(StandardCharsets.UTF_8);
                byte[] pdfBytes = Base64.getDecoder().decode(base64String);
                
                return new DanfeResponse(xmlBytes, pdfBytes);
            } else {
                // Isso aqui pega casos raros onde não lançou exceção, mas não é 200 OK
                log.warn(">>> A API Python retornou status não esperado: {}", response.getStatusCode());
                throw new RuntimeException("Serviço de notas indisponível no momento. Por favor, tente novamente mais tarde.");
            }

        } catch (HttpStatusCodeException e) {
            // Pega erros HTTP específicos (4xx e 5xx) que o RestTemplate lança
            log.error("Erro HTTP {} na integração com a API Python: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Falha no serviço de notas. Por favor, tente novamente mais tarde.");
            
        } catch (RestClientException e) {
            // Pega erros de conexão (ex: container do Python caiu, timeout, etc)
            log.error("Erro de conexão com o microserviço Python: {}", e.getMessage());
            throw new RuntimeException("Serviço de consulta offline. Por favor, tente novamente mais tarde.");
            
        } catch (Exception e) {
            // Pega qualquer outro erro (ex: erro ao ler o JSON)
            log.error("Erro fatal e inesperado na DanfeRapidaService: {}", e.getMessage(), e);
            throw new RuntimeException("Ocorreu um erro interno ao processar a nota. Por favor, tente novamente mais tarde.");
        }
    }

    private void validateEndpoint() {
        if (danfeApiUrl == null || danfeApiUrl.isBlank()) {
            throw new IllegalStateException("A integração DANFE não está configurada.");
        }
        URI uri = URI.create(danfeApiUrl);
        boolean local = "localhost".equalsIgnoreCase(uri.getHost()) || "127.0.0.1".equals(uri.getHost());
        if (!"https".equalsIgnoreCase(uri.getScheme()) && !local) {
            throw new IllegalStateException("A URL externa da integração DANFE deve usar HTTPS.");
        }
    }
}
