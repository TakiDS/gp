package com.example.back_end.UsuarioSistema.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UsuarioSistemaDto(
    
    @NotBlank(message = "O nome do titular é obrigatório")
    String nomeTitular,

    @NotBlank(message = "O email é obrigatório")
    @Email(message = "Formato de email inválido")
    String emailTitular
) {
} 