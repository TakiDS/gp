package com.example.back_end.Titular.dto;

import java.util.UUID;

import com.example.back_end.Titular.domain.StatusPerfil;

public record TitularUpdate(
    UUID uuid,
    StatusPerfil statusPerfil
) {
    
}
