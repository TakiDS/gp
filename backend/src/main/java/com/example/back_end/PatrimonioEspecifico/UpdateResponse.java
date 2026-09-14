package com.example.back_end.PatrimonioEspecifico;


import java.util.UUID;

import com.example.back_end.Comodato.termos.ContextoTermo;
import com.example.back_end.PatrimonioGeral.PatGerUpdatePatEsp;

public record UpdateResponse(
    UUID uuid,
    String numSerie,
    EstadoEnum estado, //baixa, doação, extravio, manutenção
    PatGerUpdatePatEsp patrimonio,
    String observacao,
    ContextoTermo contexto

) {
    
}
