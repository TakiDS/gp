package com.example.back_end.Comodato;

import java.time.LocalDate;
import java.util.UUID;

import com.example.back_end.Titular.dto.TitularDto;

public record ComodatoDados(
    UUID uuid,
    LocalDate dataInicio,
    LocalDate dataFimEsperado,
    
    TitularDto titular
) {
    
}
