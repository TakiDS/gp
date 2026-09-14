package com.example.back_end.Immudb;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.back_end.Immudb.MeuTeste.DetalhesDTO;
import com.example.back_end.Immudb.MeuTeste.LogFinal;
// --------------------------------------------------------
@RestController
@RequestMapping("/api/historico")
public class HistoricoImmuController {

    @Autowired
    private LogFinal logFinal;

    // 1. Endpoint específico por Entidade (com filtros opcionais)
    @GetMapping("/{tipo}/{uuid}")
    public ResponseEntity<?> getHistorico(
            @PathVariable String tipo,
            @PathVariable String uuid,
            @RequestParam(required = false) String acao,
            @RequestParam(required = false) String autor,
            @RequestParam(required = false) String codPat,
            @RequestParam(required = false) String dataInicio,
            @RequestParam(required = false) String dataFim,
            Pageable paginacao
        ) {

        // Se for patrimônio, aplicamos a busca com os filtros (o uuid já vai forçado)
        if (tipo.equalsIgnoreCase("patrimonio")) {
            return ResponseEntity.ok(logFinal.buscarHistoricoComFiltros(
                    uuid, acao, autor, codPat, dataInicio, dataFim, paginacao
            ));
        }

        // LÓGICA DE TRANSIÇÃO: Para os outros tipos que ainda usam as tabelas antigas
        String tabela = switch (tipo.toLowerCase()) {
            case "usuario" -> "historico_usuarios";
            case "localizacao" -> "historico_localizacao";
            case "categoria" -> "historico_categoria";
            case "nota-fiscal" -> "historico_nota_fiscal";
            default -> null;
        };

        if (tabela == null) {
            return ResponseEntity.badRequest().body("Tipo de histórico inválido.");
        }

        // Mesmo para os outros (enquanto você transiciona), passamos pela busca nova
        return ResponseEntity.ok(logFinal.buscarHistoricoComFiltros(
                uuid, acao, autor, codPat, dataInicio, dataFim, paginacao
        ));
    }

    // 2. Endpoint geral de Todos os Registros (com filtros opcionais)
    @GetMapping("/todos")
    public ResponseEntity<Page<DetalhesDTO>> listarTudo(
            @RequestParam(required = false) String uuidEntidade,
            @RequestParam(required = false) String acao,
            @RequestParam(required = false) String autor,
            @RequestParam(required = false) String codPat,
            @RequestParam(required = false) String dataInicio,
            @RequestParam(required = false) String dataFim,
            Pageable paginacao
    ) {
        // Se o front não mandar nenhum parâmetro, as variáveis serão nulas e o LogFinal trará tudo.
        Page<DetalhesDTO> logs = logFinal.buscarHistoricoComFiltros(
                uuidEntidade, acao, autor, codPat, dataInicio, dataFim, paginacao
        );
        
        return ResponseEntity.ok(logs);
    }
}