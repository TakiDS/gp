package com.example.back_end.Comodato;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ComodatoResumoResponse(
    UUID uuid,
    StatusEnum estado,
    LocalDate dataInicio,
    LocalDate dataFimEsperado,
    LocalDate dataFim,
    List<PatrimonioResumoResponse> patrimonios
) {
    
}
