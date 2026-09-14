package com.example.back_end.UsuarioSistema.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DefinirSenhaDto(
    @NotBlank(message = "O token de validação é obrigatório.")
    String token,

    @NotBlank(message = "A nova senha não pode estar em branco.")
    @Size(min = 8, message = "A senha deve conter pelo menos 8 caracteres.")
    @Pattern(
    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*\\W).{8,}$",
        message = "A senha deve conter letra maiúscula, minúscula, número e símbolo."
    )
    String novaSenha,

    String confirmarSenha
) {}