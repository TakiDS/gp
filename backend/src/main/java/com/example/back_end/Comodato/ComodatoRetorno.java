package com.example.back_end.Comodato;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ComodatoRetorno(
    UUID uuid,
    LocalDate dataInicio,
    LocalDate dataFimEsperado,
    LocalDate dataFim,
    StatusEnum estado,
    String nomeTitular,
    List<PatrimonioResumoResponse> patrimonios
) {
    
}
