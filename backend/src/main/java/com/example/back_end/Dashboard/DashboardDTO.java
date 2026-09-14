package com.example.back_end.Dashboard;

import java.math.BigDecimal;
import java.util.Map;

public record DashboardDTO(
    long totalPatrimonios,
    long totalNotaFiscal,
    BigDecimal valorTotalPatrimonio,
    Map<String, Long> itensPorCategoria,
    Map<String, Long> itensPorEstado
) {
    
}
