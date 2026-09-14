package com.example.back_end.UsuarioSistema.dto;

import com.example.back_end.UsuarioSistema.domain.UsuarioRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ConviteDto(
    @NotBlank 
    String nome,

    @NotBlank 
    @Email 
    String email,

    @NotNull 
    UsuarioRole role
) {}
