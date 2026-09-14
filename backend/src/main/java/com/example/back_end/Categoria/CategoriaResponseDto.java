package com.example.back_end.Categoria;

import java.util.UUID;

public record CategoriaResponseDto(
    UUID uuid,
    String nome,
    String descricao,
    int totalPatrimonio
) {
}
