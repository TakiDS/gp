package com.example.back_end.PatrimonioGeral;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.example.back_end.Categoria.CategoriaEspecificoDTO;
import com.example.back_end.NotaFiscal.NotaFiscalDTO;

public record PatrimonioGeralDTO(
    UUID id,
    String descricao,
    LocalDate dataAquisicao,
    BigDecimal valorAquisicao,
    LocalDateTime dataCriacao,

    CategoriaEspecificoDTO categoria, //pronto italo ta aqui, Um dto só pra isso
    NotaFiscalDTO notaFiscal,
    boolean patrimonioAutomatico
) {
}