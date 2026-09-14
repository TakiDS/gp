package com.example.back_end.Immudb.MeuTeste;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.codenotary.immudb4j.ImmuClient;
import jakarta.annotation.PostConstruct; // Use javax.annotation.PostConstruct se o Spring for antigo
import jakarta.annotation.PreDestroy;

@Component
public class ImmudbClientPool {

    private static final Logger log = LoggerFactory.getLogger(ImmudbClientPool.class);
    private static final int POOL_SIZE = 10;
    private final BlockingQueue<ImmuClient> pool = new LinkedBlockingQueue<>(POOL_SIZE);
    private final String host;
    private final int port;
    private final String database;
    private final String username;
    private final String password;

    public ImmudbClientPool(
            @Value("${immudb.host:localhost}") String host,
            @Value("${immudb.port:3322}") int port,
            @Value("${immudb.database:defaultdb}") String database,
            @Value("${immudb.username:immudb}") String username,
            @Value("${immudb.password}") String password) {
        this.host = host;
        this.port = port;
        this.database = database;
        this.username = username;
        this.password = password;
    }

    @PostConstruct
    public void init() {
        for (int i = 0; i < POOL_SIZE; i++) {
            pool.offer(createNewClient());
        }
        log.info("Pool do immudb inicializado com {} conexões", POOL_SIZE);
    }

    private ImmuClient createNewClient() {
        try {
            ImmuClient client = ImmuClient.newBuilder()
                    .withServerUrl(host)
                    .withServerPort(port)
                    .build();
            client.openSession(database, username, password);
            return client;
        } catch (Exception e) {
            throw new IllegalStateException("Não foi possível conectar ao immudb", e);
        }
    }

    public ImmuClient getClient() {
        try {
            // Pega o primeiro da fila (bloqueia se estiver vazia)
            return pool.take();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Erro ao pegar cliente do pool", e);
        }
    }

    public void releaseClient(ImmuClient client) {
        if (client != null) {
            pool.offer(client); // Devolve saudável para o final da fila
        }
    }

    // Usado quando a transação falha definitivamente: destrói a morta e guarda uma nova na fila
    public void recreateAndRelease(ImmuClient oldClient) {
        if (oldClient != null) {
            log.warn("Descartando conexão corrompida do immudb");
            try { oldClient.closeSession(); } catch (Exception ignored) {}
            try { oldClient.shutdown(); } catch (Exception ignored) {}
        }
        ImmuClient newClient = createNewClient();
        if (newClient != null) {
            pool.offer(newClient);
            log.info("Conexão do immudb recriada");
        }
    }

    // O PULO DO GATO: Destrói a morta e devolve uma nova IMEDIATAMENTE na mão (sem ir pra fila)
    public ImmuClient swapClient(ImmuClient oldClient) {
        if (oldClient != null) {
            log.warn("Substituindo conexão corrompida do immudb");
            try { oldClient.closeSession(); } catch (Exception ignored) {}
            try { oldClient.shutdown(); } catch (Exception ignored) {}
        }
        return createNewClient();
    }

    @PreDestroy
    public void cleanup() {
        log.info("Encerrando pool do immudb");
        for (ImmuClient client : pool) {
            if (client != null) {
                try { client.closeSession(); } catch (Exception ignored) {}
                try { client.shutdown(); } catch (Exception ignored) {}
            }
        }
    }
}
