package com.example.back_end.Titular.dto;

import java.util.UUID;

import com.example.back_end.Titular.domain.PerfilEnum;
import com.example.back_end.Titular.domain.StatusPerfil;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record TitularDto(
    UUID uuid,
    
    @NotBlank(message = "O nome é obrigatório")
    String nome,
    
    @NotBlank(message = "O email é obrigatório")
    @Email(message = "Formato de email inválido")
    String email,

    @NotBlank(message = "O CPF é obrigatório")
    @Pattern(regexp = "\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}", message = "O CPF deve estar no formato 000.000.000-00")
    String cpf,
    
    @NotNull(message = "O perfil é obrigatório")
    PerfilEnum tipoPerfil,

    StatusPerfil statusPerfil

) {}