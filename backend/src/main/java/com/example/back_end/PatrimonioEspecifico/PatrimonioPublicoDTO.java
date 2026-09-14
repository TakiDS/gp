package com.example.back_end.PatrimonioEspecifico;

import java.time.LocalDate;

public record PatrimonioPublicoDTO(
    String numPatrimonio,
    String descricao,
    EstadoEnum estado,
    String categoria,
    String localizacao,
    String numeroSerie,
    LocalDate dataAquisicao
) {}
