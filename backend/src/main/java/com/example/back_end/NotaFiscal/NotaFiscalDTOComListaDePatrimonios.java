package com.example.back_end.NotaFiscal;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.example.back_end.PatrimonioGeral.PatrimonioGeralDTOSimples;

public record NotaFiscalDTOComListaDePatrimonios(
    UUID uuid,
    String codigoNota,
    String fornecedor,
    String cnpj,
    BigDecimal valorTotalNota,
    LocalDate dataEmissao,
    StatusNota status,
    String notaFiscalUrl,
    LocalDateTime dataCriacao,
    String chaveAcesso,
    boolean criadoAutomatico,
    Integer quantidade,
    List<PatrimonioGeralDTOSimples> patrimonios // <--- A lista de filhos
) {
    
}
