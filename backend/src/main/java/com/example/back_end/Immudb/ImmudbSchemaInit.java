package com.example.back_end.Immudb;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.back_end.Immudb.MeuTeste.ImmudbClientPool;

import io.codenotary.immudb4j.ImmuClient;
import jakarta.annotation.PostConstruct;



// OBS: Ajuste a importação do ImmudbClientPool se necessário
// import com.example.back_end.Immudb.MeuTeste.ImmudbClientPool; 

@Component
public class ImmudbSchemaInit {

    @Autowired
    private ImmudbClientPool pool;

    @PostConstruct
    public void inicializarBanco() {
        System.out.println("🚀 [immudb] Iniciando verificação de tabelas...");

        List<String> tabelas = List.of(
            "historico_patrimonios",
            "historico_patrimonios_geral",
            "historico_nota_fiscal",
            "historico_usuarios",
            "historico_localizacao",
            "historico_categoria",
            "log_historico"
        );

        for (String nomeTabela : tabelas) {
            criarTabelaComRetry(nomeTabela);
        }
    }

    private void criarTabelaComRetry(String nomeTabela) {
        ImmuClient client = pool.getClient();
        boolean conexaoMorta = false;

        

        try {
            executarDDL(client, nomeTabela);
            System.out.println("✅ [immudb] Tabela garantida: " + nomeTabela);
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
            if (msg.contains("transaction") || msg.contains("session") || msg.contains("initiated")) {
                System.out.println("⚠️ [immudb] Sessão instável ao criar " + nomeTabela + ". Marcando conexão para recriar...");
                conexaoMorta = true;
            } else {
                System.err.println("❌ [immudb] Erro SQL ao criar " + nomeTabela + ": " + e.getMessage());
            }
        } finally {
            if (conexaoMorta) {
                pool.recreateAndRelease(client);
            } else {
                pool.releaseClient(client);
            }
        }
    }

    private void executarDDL(ImmuClient client, String nomeTabela) throws Exception {
        String sqlTabela;
        if ("log_historico".equals(nomeTabela)) {
            sqlTabela = "CREATE TABLE IF NOT EXISTS log_historico (" +
                        "id INTEGER AUTO_INCREMENT, " +
                        "uuid_entidade VARCHAR, " +
                        "acao VARCHAR, " +
                        "autor VARCHAR, " +
                        "cod_pat VARCHAR, " +
                        "data_hora TIMESTAMP, " +
                        "detalhes VARCHAR, " +
                        "PRIMARY KEY (id))";
        } else {
            sqlTabela = "CREATE TABLE IF NOT EXISTS " + nomeTabela + " (" +
                        "id INTEGER AUTO_INCREMENT, " +
                        "uuid_entidade VARCHAR, " +
                        "acao VARCHAR, " +
                        "detalhes VARCHAR, " +
                        "data_hora TIMESTAMP, " +
                        "usuario_resp VARCHAR, " +
                        "PRIMARY KEY (id))";
        }

        // 1. Cria Tabela (Com rollback preventivo antes)
        try {
            try { client.rollbackTransaction(); } catch (Exception ignored) {} // Prevenção Zumbi
            client.beginTransaction();
            client.sqlExec(sqlTabela);
            client.commitTransaction();
        } catch (Exception e) {
            try { client.rollbackTransaction(); } catch (Exception ex) {}
            if (e.getMessage() != null && !e.getMessage().contains("already exists")) {
                throw e; 
            }
        }

        // 2. Cria Índice (Com rollback preventivo antes)
        try {
            try { client.rollbackTransaction(); } catch (Exception ignored) {} // Prevenção Zumbi
            client.beginTransaction();
            client.sqlExec("CREATE INDEX IF NOT EXISTS ON " + nomeTabela + "(uuid_entidade)");
            client.commitTransaction();
        } catch (Exception e) {
            try { client.rollbackTransaction(); } catch (Exception ex) {}
            // Ignora erro de índice já existente
        }
    }
}