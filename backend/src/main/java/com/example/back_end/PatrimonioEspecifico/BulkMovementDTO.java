package com.example.back_end.PatrimonioEspecifico;

import java.util.List;
import java.util.UUID;

public record BulkMovementDTO(
        List<UUID> patrimonioIDS,
        UUID novoLocal,
        EstadoEnum novoStatus,
        String observacoes
        ) {

}
