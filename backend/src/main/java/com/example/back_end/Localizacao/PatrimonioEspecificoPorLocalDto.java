package com.example.back_end.Localizacao;

import java.util.List;
import java.util.UUID;

import com.example.back_end.PatrimonioEspecifico.PatrimonioSemPassarLocalizacao;

public record PatrimonioEspecificoPorLocalDto(
    UUID uuid,
    String local,
    String termoAuditoriaUrl,
    List<PatrimonioSemPassarLocalizacao> patrimonio
) {

}
//dto para o retorno de patrimonios por uuid de local