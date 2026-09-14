package com.example.back_end.Immudb;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DetalhesDiff(
    @JsonProperty("numeroPatrimonio")
    String numeroPatrimonio, // <--- Novo campo aqui

    @JsonProperty("de")
    Object de,

    @JsonProperty("para")
    Object para
) {
    
}
