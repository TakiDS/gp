package com.example.back_end.Comodato;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.example.back_end.Titular.dto.TitularPorComodato;

public record ComodatoPorUuid(
    UUID uuid,
    LocalDate dataInicio,
    LocalDate dataFimEsperado,
    LocalDate dataFim,
    boolean validacaoTermo,
    String termoUrl,
    StatusEnum estado,
    
    TitularPorComodato titular,
    List<PatrimonioResumoResponse> patrimonio
) {
} 