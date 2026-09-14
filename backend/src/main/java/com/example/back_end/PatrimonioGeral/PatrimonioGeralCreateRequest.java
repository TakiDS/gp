package com.example.back_end.PatrimonioGeral;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PatrimonioGeralCreateRequest(
    String descricao,
    LocalDate dataAquisicao,
    BigDecimal valorAquisicao,
    LocalDateTime dataCriacao,
    String numSerie,
    UUID uuid_categoria,
    UUID uuid_notaFiscalId,
    UUID uuid_localizacao, // estava sem esse aqui
    Integer quantidade ,
    boolean patrimonioAutomatico
) {
    public int quantidadeOrDefault() {
        return quantidade == null || quantidade <= 0 ? 1 : quantidade;
    }


}
