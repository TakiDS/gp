package com.example.back_end.Comodato;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ComodatoDto(
    UUID uuid,
    LocalDate dataInicio,
    LocalDate dataFimEsperado,
    UUID titularId,
    List<UUID> patrimonioIds

) {
    
}
