package com.example.back_end.NotaFiscal;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record NotaFiscalDTO(
    UUID uuid,
    String codigoNota,        // Para o "NF-000001"
    String fornecedor,        // Para o nome da empresa
    String cnpj,              // Para o CNPJ abaixo do nome
    BigDecimal valorTotalNota, // Para o "R$ 30.250,00"
    LocalDate dataEmissao,    // Para a coluna "Emissão"
    StatusNota status,        // Para a tag colorida
    String notaFiscalUrl,      // Link do arquivo
    LocalDateTime dataCriacao,
    String chaveAcesso,
    boolean criadoAutomatico         //Chave de acesso unica do banco
    
) {}