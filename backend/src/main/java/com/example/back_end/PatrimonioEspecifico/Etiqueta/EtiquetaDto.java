package com.example.back_end.PatrimonioEspecifico.Etiqueta;

import java.util.UUID;

public record EtiquetaDto(
    UUID PatrimonioId,
    String urlPreta,
    String urlBranca
) {
    
}
