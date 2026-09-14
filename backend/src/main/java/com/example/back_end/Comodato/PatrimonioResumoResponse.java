package com.example.back_end.Comodato;

import java.util.UUID;

import com.example.back_end.PatrimonioEspecifico.EstadoEnum;

public record PatrimonioResumoResponse(
    UUID uuid,
    String descricao,
    String numPatrimonio,
    EstadoEnum estado,
    String estadoFinalComodato
) {
} 
