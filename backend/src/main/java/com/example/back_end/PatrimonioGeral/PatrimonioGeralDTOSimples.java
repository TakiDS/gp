package com.example.back_end.PatrimonioGeral;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecificoDTOSimples;

public record PatrimonioGeralDTOSimples(
    UUID uuid,
    String descricao,
    BigDecimal valorAquisicao, // É bom ter o valor aqui também
    List<PatrimonioEspecificoDTOSimples> itens // <--- A lista de netos
) {
    
}
