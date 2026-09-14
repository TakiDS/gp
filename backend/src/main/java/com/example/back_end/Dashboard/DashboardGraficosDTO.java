package com.example.back_end.Dashboard;

// DTOs auxiliares (pode colocar no mesmo arquivo do DashboardDTO)

import java.util.List;


// DTO principal do Dashboard atualizado
public record DashboardGraficosDTO(
    List<StatusCountDTO> distribuicaoStatus,
    List<LocalValorDTO> valorPorLocal
) {}
