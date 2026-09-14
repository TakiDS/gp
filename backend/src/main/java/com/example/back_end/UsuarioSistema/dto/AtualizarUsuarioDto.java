package com.example.back_end.UsuarioSistema.dto;

import com.example.back_end.UsuarioSistema.domain.StatusUsuario;

public record AtualizarUsuarioDto(
    String nome,
    StatusUsuario status
) {}