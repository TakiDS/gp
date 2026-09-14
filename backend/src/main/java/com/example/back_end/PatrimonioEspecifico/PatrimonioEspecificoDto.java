package com.example.back_end.PatrimonioEspecifico;

import java.util.UUID;

import com.example.back_end.Localizacao.LocalizacaoResponseDto;
import com.example.back_end.PatrimonioGeral.PatrimonioGeralDTO;

public record PatrimonioEspecificoDto(
    UUID uuid,
    String numPatrimonio,
    String numSerie,
    EstadoEnum estado,

    LocalizacaoResponseDto localizacao,
    PatrimonioGeralDTO patrimonioGeral,
    String etiquetaUrl

) {

    
}
