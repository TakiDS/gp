package com.example.back_end.Dashboard;

import java.util.List;

import com.example.back_end.Immudb.MeuTeste.DetalhesDTO;

public record DashboardCompletoDTO(
    DashboardScreenDTO cards,
    DashboardGraficosDTO graficos,
    List<devolucoesProximas> devolucoesProximas,
    List<DetalhesDTO> historico
) {}
