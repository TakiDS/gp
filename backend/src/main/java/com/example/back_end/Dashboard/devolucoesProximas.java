package com.example.back_end.Dashboard;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;

public record devolucoesProximas(
    UUID uuid,
    List<PatrimonioEspecifico> patrimonio,
    String responsavel,
    LocalDate dataPrevista
) {
    
}
