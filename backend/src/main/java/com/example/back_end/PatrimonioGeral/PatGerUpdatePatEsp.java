package com.example.back_end.PatrimonioGeral;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PatGerUpdatePatEsp(
    UUID uuid,
    String descricao,
    LocalDate dataAquisicao,
    BigDecimal valorAquisicao,

    UUID categoriaId,
    UUID notaFiscalId
) {
    
}
