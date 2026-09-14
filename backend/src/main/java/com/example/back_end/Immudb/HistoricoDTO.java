package com.example.back_end.Immudb;

import java.time.LocalDateTime;

public record HistoricoDTO(
   String id,
    String uuidEntidade,       // Mantido String para evitar o erro de conversão
    String tipoEntidade,
    String acao,
    Object detalhes,           // Map<String, Object>
    AutorDTO usuarioResponsavel, // Mudou de String para o Objeto AutorDTO
    LocalDateTime dataHora
) {}