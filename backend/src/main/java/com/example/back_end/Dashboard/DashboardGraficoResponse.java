package com.example.back_end.Dashboard;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record DashboardGraficoResponse(
    Map<String, BigDecimal> patrimonios,
    List<CategoriaValorDTO> graficoCategoria
) {}
