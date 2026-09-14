package com.example.back_end.UsuarioSistema.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TrocaSenhaLogadoDto(
    @NotBlank(message = "A senha atual é obrigatória")
    String senhaAtual,

    @NotBlank(message = "A nova senha não pode estar em branco")
    @Size(min = 6, message = "A nova senha deve ter pelo menos 6 caracteres")
    String novaSenha
) {}