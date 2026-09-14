package com.example.back_end.Dashboard;

import java.math.BigDecimal;

public record DashboardScreenDTO(
    BigDecimal valorImobilizadoTotal,
    BigDecimal percentualCrescimentoValor, // Novo campo
    long totalAtivos,
    long totalGuardados,
    long totalEmUso, 
    long pendenciasNotaFiscal
) {}