package com.example.back_end.Categoria;

import java.util.UUID;

import org.springframework.data.domain.Page;

import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecificoDto;

public record CategoriaResponsePatDto(
    UUID uuid,
    String nome,
    String descricao,
    int totalPatrimonio,

    Page<PatrimonioEspecificoDto> patrimonio
) {
}
