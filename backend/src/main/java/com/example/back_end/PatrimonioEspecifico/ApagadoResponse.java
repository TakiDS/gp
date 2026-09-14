package com.example.back_end.PatrimonioEspecifico;

import java.util.UUID;

public record ApagadoResponse(
    UUID uuid,
    EstadoEnum estado,
    String observacao
) {
    
}
