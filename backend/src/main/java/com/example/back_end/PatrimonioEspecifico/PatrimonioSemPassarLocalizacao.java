package com.example.back_end.PatrimonioEspecifico;

import java.util.UUID;

import com.example.back_end.PatrimonioGeral.PatrimonioGeralDTO;

public record PatrimonioSemPassarLocalizacao(
    UUID uuid,
    String numPatrimonio,
    String numSerie,
    EstadoEnum estado,

    PatrimonioGeralDTO patrimonioGeral
) {
    
}
