package com.example.back_end.NotaFiscal;

import java.util.Collections;
import java.util.List;

import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecificoDTOSimples;
import com.example.back_end.PatrimonioGeral.PatrimonioGeralDTOSimples;

public class NotaFiscalDetalhadaMapper {

    public static NotaFiscalDTOComListaDePatrimonios toDetalheDTO(NotaFiscal nf) {
        
        List<PatrimonioGeralDTOSimples> listaGerais = Collections.emptyList();

        if (nf.getPatrimoniosGerais() != null) {
            listaGerais = nf.getPatrimoniosGerais().stream()
                .map(geral -> {
                    // 1. Mapeia os netos (Específicos) - Passando os 4 parâmetros do seu record
                    List<PatrimonioEspecificoDTOSimples> itensSimples = Collections.emptyList();
                    
                    if (geral.getPatrimonio() != null) {
                        itensSimples = geral.getPatrimonio().stream()
                            .map(esp -> new PatrimonioEspecificoDTOSimples(
                                esp.getUuid(),
                                esp.getNumPatrimonio(),
                                esp.getNumSerie(),
                                esp.getEstado() != null ? esp.getEstado().toString() : "N/D" // Converte Enum para String
                            ))
                            .toList();
                    }

                    // 2. Mapeia o filho (Geral) - Passando os 4 parâmetros do record que você mandou
                    return new PatrimonioGeralDTOSimples(
                        geral.getUuid(),
                        geral.getDescricao(),
                        geral.getValorAquisicao(), // O BigDecimal que você adicionou
                        itensSimples               // A lista de netos
                    );
                })
                .toList();
        }

        // 3. Retorna o objeto principal
        return new NotaFiscalDTOComListaDePatrimonios(
            nf.getUuid(),
            nf.getCodigoNota(),
            nf.getFornecedor(),
            nf.getCnpj(),
            nf.getValorTotalNota(),
            nf.getDataEmissao(),
            nf.getStatus(),
            nf.getNotaFiscalUrl(),
            nf.getDataCriacao(),
            nf.getChaveAcesso(),
            nf.isCriadoAutomatico(),
            nf.getQuantidadeItensNota(),
            listaGerais 
        );
    }
}