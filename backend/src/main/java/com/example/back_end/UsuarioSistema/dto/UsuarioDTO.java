package com.example.back_end.UsuarioSistema.dto;

import java.util.UUID;

import com.example.back_end.UsuarioSistema.domain.StatusUsuario;
import com.example.back_end.UsuarioSistema.domain.UsuarioSistema;

public record UsuarioDTO(
    UUID uuid,
    String nome,
    String login, // Email
    String role,
    StatusUsuario status
) {
    
    public UsuarioDTO(UsuarioSistema usuario) {
        this(
            usuario.getUuid(),                // <--- Mude de getId() para getUuid()
            usuario.getNome(),
            usuario.getLogin(),               // Verifique se é getEmail() ou getLogin()
            usuario.getRole().toString(),    // Verifique se é getPerfil() ou getRole()
            usuario.getStatus()
        );
    }
}
