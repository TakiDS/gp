package com.example.back_end.PatrimonioEspecifico;

public record PatrimonioEspecificoUpdateRequest(
    String numSerie,
    EstadoEnum estado
) {
}
