package com.example.back_end.NotaFiscal;

import java.math.BigDecimal;
import java.time.LocalDate;

public record NotaFiscalManualRequest(
    String fornecedor,
    String cnpj,
    BigDecimal valorTotalNota,
    LocalDate dataEmissao,
    Integer quantidadeItensNota,
    String urlCloudinary
) {}
