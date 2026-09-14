package com.example.back_end.Infra.seguranca.dto;

public record LoginResponseDto(
    String token,
    String nome,
    String email,
    String role
) {}