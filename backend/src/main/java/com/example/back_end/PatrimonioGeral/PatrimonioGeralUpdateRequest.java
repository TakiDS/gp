package com.example.back_end.PatrimonioGeral;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PatrimonioGeralUpdateRequest(
    String descricao,
    LocalDate dataAquisicao,
    BigDecimal valorAquisicao,
    LocalDateTime dataCriacao,
    UUID uuid_categoria,
    UUID uuid_notaFiscalId

) {
    
}
