package com.example.back_end.Categoria;

import java.util.List;
import java.util.UUID;

import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecificoDto;
import com.example.back_end.PatrimonioGeral.PatrimonioGeralDTO;

public record CategoriaDTO(
        UUID uuid,
        String nome,
        int totalPatrimonio,
        String descricao,
        List<PatrimonioGeralDTO> patrimonioGeral,
        List<PatrimonioEspecificoDto> patrimonioEspecifico
        ) {
    // Construtor auxiliar para o Mapper usar sem precisar da lista (evita recursão!)

    public CategoriaDTO(UUID uuid, String nome, int totalPatrimonio) {
        this(uuid, nome, totalPatrimonio, null, null, null);
    }
}
