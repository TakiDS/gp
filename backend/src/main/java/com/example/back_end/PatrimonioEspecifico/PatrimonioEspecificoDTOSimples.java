package com.example.back_end.PatrimonioEspecifico;

import java.util.UUID;

public record PatrimonioEspecificoDTOSimples(
    UUID uuid,
    String numPatrimonio,
    String numSerie,
    String estadoConservacao // Converta o Enum para String no Mapper
) {
    
}
