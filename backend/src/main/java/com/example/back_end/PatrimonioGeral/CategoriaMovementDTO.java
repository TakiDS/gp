package com.example.back_end.PatrimonioGeral;

import java.util.List;
import java.util.UUID;

public record CategoriaMovementDTO(
    List<UUID> patrimonioIDS,
    UUID novoCategoria
) {
    
}
