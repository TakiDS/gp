package com.example.back_end.Localizacao.auditoria;

import java.util.List;
import java.util.Map;

import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;

public record DadosImpressaoAuditoria(
    String local,
    int totalPatrimonio,
    String dataAuditoria,
    Map<String, List<PatrimonioEspecifico>> patrimoniosPorCategoria
) {
    
}
