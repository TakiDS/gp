package com.example.back_end.Historico.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import com.example.back_end.Historico.domain.TipoAcaoEnum;

public record HistoricoDto(
    Long id,
    LocalDateTime dataHora,
    TipoAcaoEnum tipoAcao,
    String detalhes,
    String idEntidadeAfetada,
    UUID usuarioId,
    String nomeUsuarioResponsavel
) {}