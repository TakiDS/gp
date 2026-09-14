package com.example.back_end.Immudb.MeuTeste;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.back_end.Immudb.AutorDTO;
import com.example.back_end.Immudb.DetalhesDiff;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import io.codenotary.immudb4j.ImmuClient;
import io.codenotary.immudb4j.sql.SQLQueryResult;
import io.codenotary.immudb4j.sql.SQLValue;


@Service
public class LogFinal {

    @Autowired
    private ImmudbClientPool pool;

    @Autowired
    private ObjectMapper mapper;

    // Pool de threads para registros de auditoria assíncrono (máximo 5 threads)
    //private final ExecutorService executorService = Executors.newFixedThreadPool(5);
    // Testando isso
    // Fila ordenada para registros de auditoria assíncrona (1 thread processa a fila sequencialmente)
    private final ExecutorService executorService = Executors.newSingleThreadExecutor();

    public ObjectNode registroFim(PatrimonioEspecifico objeto, String acao, AutorDTO autor, DetalhesDiff dife) {
        ObjectNode jsonGerado = montarJson(objeto, acao, autor, "PATRIMONIO", dife);

        // Submete para execução assíncrona
        executorService.execute(() -> {
            registrarNoImmuDbComRetentativa(objeto, acao, autor, jsonGerado);
        });

        return jsonGerado; 
    }

    private void registrarNoImmuDbComRetentativa(PatrimonioEspecifico objeto, String acao, AutorDTO autor, ObjectNode jsonGerado) {
        int tentativas = 3;
        long delayMs = 100;

        // 1. Pega a conexão UMA VEZ ANTES DO LOOP
        ImmuClient client = pool.getClient();

        for (int i = 0; i < tentativas; i++) {
            try {
                client.beginTransaction();

                client.sqlExec(
                        "INSERT INTO log_historico (uuid_entidade, acao, autor, cod_pat, data_hora, detalhes) VALUES (?, ?, ?, ?, NOW(), ?)",
                        new SQLValue(objeto.getUuid().toString()),
                        new SQLValue(acao),
                        new SQLValue(autor.toString()),
                        new SQLValue(objeto.getNumPatrimonio()),
                        new SQLValue(jsonGerado.toString())
                );

                client.commitTransaction();
                System.out.println("✅ Log registrado com sucesso: " + objeto.getNumPatrimonio() + " (" + acao + ")");
                
                // Sucesso absoluto: devolve saudável e encerra
                pool.releaseClient(client);
                return; 

            } catch (Exception e) {
                System.err.println("⚠️ Tentativa " + (i + 1) + " falhou para o patrimônio " + objeto.getNumPatrimonio() + ": " + e.getMessage());
                try { client.rollbackTransaction(); } catch (Exception ignored) {}
                
                // Se não for a última tentativa, faz o SWAP (troca em mãos) e espera
                if (i < tentativas - 1) {
                    client = pool.swapClient(client); 
                    try {
                        Thread.sleep(delayMs);
                        delayMs *= 2; 
                    } catch (InterruptedException ignored) {}
                }
            } 
        }

        // Se o loop acabar e não deu return, significa que falhou todas as vezes
        System.err.println("❌ Falha definitiva ao registrar log após " + tentativas + " tentativas: " + objeto.getNumPatrimonio());
        pool.recreateAndRelease(client); // Destrói a última conexão que falhou e recria pro pool
    }

    public ObjectNode montarJson(PatrimonioEspecifico objeto, String acao, AutorDTO autor, String tipoEntidade, DetalhesDiff detalhes) {
        ObjectNode noJson = mapper.createObjectNode();

        noJson.put("uuidEntidade", objeto.getUuid().toString());
        noJson.put("tipoEntidade", tipoEntidade);
        noJson.put("acao", acao);
        noJson.put("descricao", objeto.getPatrimonioGeral().getDescricao());
        noJson.put("numeroSerie", objeto.getNumSerie());
        noJson.put("dataHora", LocalDateTime.now().toString());

        noJson.putPOJO("autor", autor);
        noJson.putPOJO("detalhes", detalhes);

        return noJson;
    }

    public Page<DetalhesDTO> buscarHistoricoModerno(String uuid, Pageable paginacao) {
        List<DetalhesDTO> historico = new ArrayList<>();
        int limit = paginacao.getPageSize();
        long offset = paginacao.getOffset();
        long total = 0;

        String sqlData = "SELECT detalhes FROM log_historico WHERE uuid_entidade = ? "
                + "ORDER BY data_hora DESC LIMIT " + limit + " OFFSET " + offset;
        String sqlCount = "SELECT COUNT(*) FROM log_historico WHERE uuid_entidade = ?";

        int tentativas = 3;
        
        // 1. Pega a conexão UMA VEZ ANTES DO LOOP
        ImmuClient client = pool.getClient();

        for (int i = 0; i < tentativas; i++) {
            try {
                client.beginTransaction();

                SQLQueryResult countResult = client.sqlQuery(sqlCount, new SQLValue(uuid));
                if (countResult.next()) {
                    total = countResult.getLong(0);
                }

                SQLQueryResult result = client.sqlQuery(sqlData, new SQLValue(uuid));
                while (result.next()) {
                    String jsonRaw = result.getString(0);
                    if (jsonRaw != null) {
                        JsonNode jsonNode = mapper.readTree(jsonRaw);
                        historico.add(new DetalhesDTO(jsonNode));
                    }
                }
                
                client.commitTransaction();
                
                // Sucesso absoluto: devolve saudável e retorna dados
                pool.releaseClient(client);
                return new PageImpl<>(historico, paginacao, total);

            } catch (Exception e) {
                System.err.println("⚠️ Tentativa " + (i + 1) + " de busca falhou por UUID (" + uuid + "): " + e.getMessage());
                try { client.rollbackTransaction(); } catch (Exception ignored) {}
                
                // Se falhou e tem mais tentativas, faz o SWAP (troca em mãos)
                if (i < tentativas - 1) {
                    client = pool.swapClient(client);
                }
            } 
        }

        System.err.println("❌ Falha definitiva na busca por UUID após " + tentativas + " tentativas.");
        pool.recreateAndRelease(client); // Destrói a última conexão que falhou e recria pro pool
        return new PageImpl<>(historico, paginacao, total);
    }

    public Page<DetalhesDTO> buscarTodosHistoricos(Pageable paginacao) {
        List<DetalhesDTO> historico = new ArrayList<>();
        int limit = paginacao.getPageSize();
        long offset = paginacao.getOffset();
        long total = 0;

        String sqlData = String.format(
                "SELECT detalhes FROM log_historico ORDER BY data_hora DESC LIMIT %d OFFSET %d",
                limit, offset
        );
        String sqlCount = "SELECT COUNT(*) FROM log_historico";

        int tentativas = 3;
        
        // 1. Pega a conexão UMA VEZ ANTES DO LOOP
        ImmuClient client = pool.getClient(); 

        for (int i = 0; i < tentativas; i++) {
            try {
                client.beginTransaction();

                SQLQueryResult countResult = client.sqlQuery(sqlCount);
                if (countResult.next()) {
                    total = countResult.getLong(0);
                }

                SQLQueryResult result = client.sqlQuery(sqlData);
                while (result.next()) {
                    String jsonRaw = result.getString(0);
                    if (jsonRaw != null) {
                        JsonNode jsonNode = mapper.readTree(jsonRaw);
                        historico.add(new DetalhesDTO(jsonNode));
                    }
                }
                
                client.commitTransaction(); 
                
                // Sucesso absoluto: devolve saudável e retorna dados
                pool.releaseClient(client);      
                return new PageImpl<>(historico, paginacao, total);

            } catch (Exception e) {
                System.err.println("⚠️ Tentativa " + (i + 1) + " de busca paginada falhou: " + e.getMessage());
                try { client.rollbackTransaction(); } catch (Exception ignored) {}
                
                // Se falhou e tem mais tentativas, faz o SWAP (troca em mãos)
                if (i < tentativas - 1) {
                    client = pool.swapClient(client);
                }
            } 
        }

        System.err.println("❌ Falha definitiva na busca geral após " + tentativas + " tentativas.");
        pool.recreateAndRelease(client); // Destrói a última conexão que falhou e recria pro pool
        return new PageImpl<>(historico, paginacao, total);
    }

    /**
     * Busca o histórico de logs aplicando filtros dinâmicos e paginação.
     */
    public Page<DetalhesDTO> buscarHistoricoComFiltros(
            String uuidEntidade, String acao, String autor, String codPat, 
            String dataInicio, String dataFim, Pageable paginacao) {
        
        List<DetalhesDTO> historico = new ArrayList<>();
        int limit = paginacao.getPageSize();
        long offset = paginacao.getOffset();
        long total = 0;

        // 1. Construtor de Query Dinâmica
        List<String> conditions = new ArrayList<>();
        List<SQLValue> params = new ArrayList<>();

        if (uuidEntidade != null && !uuidEntidade.isBlank()) {
            conditions.add("uuid_entidade = ?");
            params.add(new SQLValue(uuidEntidade));
        }
        if (acao != null && !acao.isBlank()) {
            conditions.add("acao = ?");
            params.add(new SQLValue(acao));
        }
        if (autor != null && !autor.isBlank()) {
            // Opcional: Se quiser busca parcial pelo nome do autor, use LIKE
            conditions.add("autor LIKE ?");
            params.add(new SQLValue("%" + autor + "%"));
        }
        if (codPat != null && !codPat.isBlank()) {
            conditions.add("cod_pat = ?");
            params.add(new SQLValue(codPat));
        }
        if (dataInicio != null && !dataInicio.isBlank()) {
            conditions.add("data_hora >= ?");
            // Supondo que a data chegue no formato 'YYYY-MM-DD HH:MM:SS'
            params.add(new SQLValue(dataInicio)); 
        }
        if (dataFim != null && !dataFim.isBlank()) {
            conditions.add("data_hora <= ?");
            params.add(new SQLValue(dataFim));
        }

        String whereClause = conditions.isEmpty() ? "" : " WHERE " + String.join(" AND ", conditions);

        String sqlData = "SELECT detalhes FROM log_historico" + whereClause + 
                         " ORDER BY data_hora DESC LIMIT " + limit + " OFFSET " + offset;
        String sqlCount = "SELECT COUNT(*) FROM log_historico" + whereClause;

        SQLValue[] sqlParams = params.toArray(new SQLValue[0]);

        // 2. Execução com Retentativas (mesma lógica que você já fez muito bem)
        int tentativas = 3;
        ImmuClient client = pool.getClient();

        for (int i = 0; i < tentativas; i++) {
            try {
                client.beginTransaction();

                // Busca o Total (para a paginação)
                SQLQueryResult countResult = client.sqlQuery(sqlCount, sqlParams);
                if (countResult.next()) {
                    total = countResult.getLong(0);
                }

                // Busca os Dados
                SQLQueryResult result = client.sqlQuery(sqlData, sqlParams);
                while (result.next()) {
                    String jsonRaw = result.getString(0);
                    if (jsonRaw != null) {
                        JsonNode jsonNode = mapper.readTree(jsonRaw);
                        historico.add(new DetalhesDTO(jsonNode));
                    }
                }
                
                client.commitTransaction();
                
                pool.releaseClient(client);
                return new PageImpl<>(historico, paginacao, total);

            } catch (Exception e) {
                System.err.println("⚠️ Tentativa " + (i + 1) + " de busca filtrada falhou: " + e.getMessage());
                try { client.rollbackTransaction(); } catch (Exception ignored) {}
                
                if (i < tentativas - 1) {
                    client = pool.swapClient(client);
                }
            } 
        }

        System.err.println("❌ Falha definitiva na busca filtrada após " + tentativas + " tentativas.");
        pool.recreateAndRelease(client);
        return new PageImpl<>(historico, paginacao, total);
    }

}