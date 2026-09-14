package com.example.back_end.Titular.dto;

import java.util.List;
import java.util.UUID;

import com.example.back_end.Comodato.ComodatoRetorno;

public record ComodatoByTitular(
    UUID uuid,
    String nome,
    String email,
    List<ComodatoRetorno> comodatos
    
) {
    
}
