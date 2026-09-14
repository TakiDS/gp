package com.example.back_end.Titular.dto;

import java.util.List;
import java.util.UUID;

import com.example.back_end.Comodato.ComodatoResumoResponse;
import com.example.back_end.Titular.domain.PerfilEnum;
import com.example.back_end.Titular.domain.StatusPerfil;

public record TitularRequestDto(
    UUID uuid,
    String nome,
    String email,
    PerfilEnum tipoPerfil,
    StatusPerfil statusPerfil,

    List<ComodatoResumoResponse> comodatos
) {
}
