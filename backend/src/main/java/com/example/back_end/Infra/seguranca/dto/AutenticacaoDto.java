package com.example.back_end.Infra.seguranca.dto;

import jakarta.validation.constraints.NotBlank;

public record AutenticacaoDto(
    @NotBlank(message = "O login (email) é obrigatório")
    String login,

    @NotBlank(message = "A senha é obrigatória")
    String senha
) {}