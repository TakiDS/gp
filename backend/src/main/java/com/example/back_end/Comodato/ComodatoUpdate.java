package com.example.back_end.Comodato;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ComodatoUpdate(
    UUID uuid,
    LocalDate dataInicio,
    LocalDate dataFimEsperado,
    LocalDate dataFim,

    List<UUID> patrimonioIds
) {
    
}
