package com.example.back_end.Titular.dto;

import java.util.UUID;

public record TitularPorComodato(
    UUID uuid,
    String nome,
    String email
) {
    
}
