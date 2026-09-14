package com.example.back_end.Comodato;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;


public record ComodatoResponse(
    UUID uuid,
    LocalDate dataInicio,
    LocalDate dataFimEsperado,
    LocalDate dataFim,
    boolean validacaoTermo,
    String termoUrl,
    TipoUsoEnum tipoUso,
    StatusEnum estado,

    List<PatrimonioResumoResponse> patrimonios,  //array

    UUID titularId,
    String nome,
    String email
) {
}
