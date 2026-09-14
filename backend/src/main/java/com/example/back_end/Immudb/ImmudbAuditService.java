// package com.example.back_end.Immudb;

// import java.time.Instant;
// import java.time.LocalDateTime; // Importe seu DTO novo
// import java.time.ZoneId;
// import java.util.ArrayList; // Importe seu DTO novo
// import java.util.List;
// import java.util.regex.Matcher;
// import java.util.regex.Pattern;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import com.fasterxml.jackson.databind.ObjectMapper;

// import io.codenotary.immudb4j.ImmuClient;
// import io.codenotary.immudb4j.sql.SQLQueryResult;
// import io.codenotary.immudb4j.sql.SQLValue;



// @Service
// public class ImmudbAuditService {

//     @Autowired
//     private ImmuClient client;

//     @Autowired
//     private ObjectMapper objectMapper;

//     @Autowired
//     private ImmudbFormatter formatter;

//     @Autowired
//     private ImmudbLogMerger logMerger;

//     public synchronized void registrarLog(String tabela, String uuid, String acao, Object entidade, String usuarioResp) {
//         try {
//             String jsonDetalhes = objectMapper.writeValueAsString(entidade);
//             if (tabela.equals("historico_usuarios")) {
//                 jsonDetalhes = jsonDetalhes.replaceAll("\"senha\":\".*?\"", "\"senha\":\"***PROTECTED***\"");
//             }
//             try { client.rollbackTransaction(); } catch (Exception ex) { }
//             client.beginTransaction();

//             client.sqlExec(
//                 "INSERT INTO " + tabela + " (uuid_entidade, acao, detalhes, usuario_resp, data_hora) VALUES (?, ?, ?, ?, NOW())",
//                 new SQLValue(uuid), new SQLValue(acao), new SQLValue(jsonDetalhes), new SQLValue(usuarioResp)
//             );
//             client.commitTransaction();
//         } catch (Exception e) {
//             tratarErroLeitura(e);
//         }
//     }

//     private void processarResultado(SQLQueryResult result, List<HistoricoDTO> lista, String tabelaOrigem) {
//         if (result == null) return;
//         try {
//             while (result.next()) {
//                 try {
//                     // TIMESTAMP no Immudb é lido como Long (micros)
//                     long ts = result.getLong(5); 
//                     LocalDateTime dataReal = converterTimestampImmu(ts);
                    
//                     Object detalhes = formatter.padronizarJsonDetalhes(result.getString(3));
//                     String nomeTabela = formatter.formatarNomeTabela(tabelaOrigem);
                    
//                     lista.add(new HistoricoDTO(
//                         String.valueOf(result.getInt(0)),
//                         result.getString(1),
//                         nomeTabela.contains("Patrimônio") ? "Patrimônio" : nomeTabela,
//                         result.getString(2),
//                         detalhes,
//                         extrairAutor(result.getString(4)),
//                         dataReal
//                     ));
//                 } catch (Exception e) {
//                     System.err.println("Erro na linha: " + e.getMessage());
//                 }
//             }
//         } catch (Exception e) {
//             System.err.println("Erro de SQL: " + e.getMessage());
//         }
//     }

//     private LocalDateTime converterTimestampImmu(long ts) {
//         if (ts <= 0) return LocalDateTime.now();
//         // Immudb costuma usar microssegundos
//         if (ts > 1_000_000_000_000_000L) {
//             return Instant.ofEpochSecond(ts / 1_000_000, (ts % 1_000_000) * 1000)
//                     .atZone(ZoneId.systemDefault()).toLocalDateTime();
//         }
//         return Instant.ofEpochMilli(ts).atZone(ZoneId.systemDefault()).toLocalDateTime();
//     }

//     public List<HistoricoDTO> buscarHistorico(String tabela, String uuidEntidade) {
//     List<HistoricoDTO> lista = new ArrayList<>();
//     try {
//         iniciarTransacaoSegura();
//         SQLQueryResult result = client.sqlQuery(
//             "SELECT id, uuid_entidade, acao, detalhes, usuario_resp, data_hora FROM " + tabela
//             + " WHERE uuid_entidade = ? ORDER BY id DESC",
//             new SQLValue(uuidEntidade)
//         );
//         processarResultado(result, lista, tabela);
//         client.commitTransaction();
//     } catch (Exception e) { tratarErroLeitura(e); }
    
//     // IMPORTANTE: Para histórico individual, NÃO USAR o merger. 
//     // Queremos ver cada movimentação como um evento único.
//     return lista; 
// }

// public List<HistoricoDTO> buscarHistoricoCompletoPatrimonio(String uuidEspecifico, String uuidGeral) {
//     List<HistoricoDTO> lista = new ArrayList<>();
//     if (uuidEspecifico != null) lista.addAll(buscarHistorico("historico_patrimonios", uuidEspecifico));
//     if (uuidGeral != null) lista.addAll(buscarHistorico("historico_patrimonios_geral", uuidGeral));
    
//     // Ordena por data (mais recente primeiro)
//     lista.sort((h1, h2) -> h2.dataHora().compareTo(h1.dataHora()));
    
//     // Retornamos a lista pura. Se o seu LogMerger estiver bugado, 
//     // ele é quem está sumindo com seus dados.
//     return lista; 
// }

//     public List<HistoricoDTO> buscarTodosOsLogs() {
//         List<HistoricoDTO> listaGlobal = new ArrayList<>();
//         String[] tabelas = { "historico_patrimonios", "historico_patrimonios_geral", "historico_nota_fiscal", "historico_localizacao", "historico_categoria", "historico_usuarios" };
//         try {
//             iniciarTransacaoSegura();
//             for (String tabela : tabelas) {
//                 try {
//                     SQLQueryResult result = client.sqlQuery("SELECT id, uuid_entidade, acao, detalhes, usuario_resp, data_hora FROM " + tabela);
//                     processarResultado(result, listaGlobal, tabela);
//                 } catch (Exception e) { }
//             }
//             client.commitTransaction();
//             listaGlobal.sort((h1, h2) -> h2.dataHora().compareTo(h1.dataHora()));
//             return logMerger.unificarLogsRelacionados(listaGlobal);
//         } catch (Exception e) {
//             tratarErroLeitura(e);
//             return new ArrayList<>();
//         }
//     }

//     public List<HistoricoDTO> buscarPatrimoniosApagados(String termoBusca) {
//         List<HistoricoDTO> lista = new ArrayList<>();
//         try {
//             String sql = "SELECT id, uuid_entidade, acao, detalhes, usuario_resp, data_hora FROM historico_patrimonios WHERE acao = 'BAIXA/APAGADO'";
//             if (termoBusca != null && !termoBusca.isBlank()) sql += " AND (detalhes LIKE ? OR usuario_resp LIKE ?)";
//             sql += " ORDER BY id DESC";
//             iniciarTransacaoSegura();
//             SQLQueryResult result = (termoBusca != null && !termoBusca.isBlank()) ? 
//                 client.sqlQuery(sql, new SQLValue("%"+termoBusca+"%"), new SQLValue("%"+termoBusca+"%")) : client.sqlQuery(sql);
//             processarResultado(result, lista, "historico_patrimonios");
//             client.commitTransaction();
//         } catch (Exception e) { tratarErroLeitura(e); }
//         return lista;
//     }

    

//     // --- AUXILIARES ---
//     private void iniciarTransacaoSegura() throws Exception {
//         try { client.beginTransaction(); } catch (Exception e) { resetarSessaoForcado(); client.beginTransaction(); }
//     }
//     private void tratarErroLeitura(Exception e) {
//         try { client.rollbackTransaction(); } catch (Exception ex) { }
//         if (e.getMessage().contains("session") || e.getMessage().contains("initiated")) resetarSessaoForcado();
//     }
//     private boolean resetarSessaoForcado() {
//         try { client.closeSession(); client.openSession("defaultdb", "immudb", "immudb"); return true; } catch (Exception e) { return false; }
//     }
//     private AutorDTO extrairAutor(String user) {
//         if (user == null) return new AutorDTO("Desconhecido", "");
//         Pattern p = Pattern.compile("^(.*)\\s<(.*)>$");
//         Matcher m = p.matcher(user);
//         return m.find() ? new AutorDTO(m.group(1).trim(), m.group(2).trim()) : new AutorDTO(user, "");
//     }
// }