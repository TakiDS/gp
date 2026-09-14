package com.example.back_end.Localizacao;

import java.util.UUID;

public record LocalizacaoUpdateDto(
    UUID uuid,
    String local
) {
    
}
//dto para o put de local