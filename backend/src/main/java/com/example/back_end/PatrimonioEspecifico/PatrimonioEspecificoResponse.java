package com.example.back_end.PatrimonioEspecifico;

import java.util.UUID;

import com.example.back_end.Comodato.ComodatoDados;
import com.example.back_end.Localizacao.LocalizacaoResponseDto;
import com.example.back_end.PatrimonioGeral.PatrimonioGeralDTO;

public record PatrimonioEspecificoResponse(
    UUID uuid,
    String numPatrimonio,
    String numSerie,
    EstadoEnum estado,

    LocalizacaoResponseDto localizacao,
    PatrimonioGeralDTO patrimonioGeral,
    String etiquetaUrlPreta,  // Atualizado
    String etiquetaUrlBranca, // Adicionado
    ComodatoDados comodato,
    
    //Novo campo para o historico
    // List<Map<String, Object>> historico,
    String termoUrl
     
) {
}