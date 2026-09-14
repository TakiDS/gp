package com.example.back_end.UsuarioSistema.dto;

import java.util.UUID;

import com.example.back_end.UsuarioSistema.domain.UsuarioRole;

public record RoleUpdate(
    UUID uuid,
    UsuarioRole role
) {
    
}
