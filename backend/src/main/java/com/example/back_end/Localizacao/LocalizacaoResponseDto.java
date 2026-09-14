package com.example.back_end.Localizacao;

import java.util.UUID;

public record LocalizacaoResponseDto(
    UUID uuid,
    String local,
    int totalPatrimonio
) {
}
//dto pra retornar no get de local