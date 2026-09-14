package com.example.back_end.PatrimonioGeral;

import org.springframework.stereotype.Component;

import com.example.back_end.Categoria.CategoriaEspecificoDTO;
import com.example.back_end.NotaFiscal.NotaFiscal;
import com.example.back_end.NotaFiscal.NotaFiscalDTO;


@Component
public class PatrimonioGeralMapper {

    //create
    public PatrimonioGeral toEntity(PatrimonioGeralCreateRequest request) {
        PatrimonioGeral entity = new PatrimonioGeral();
        entity.setDescricao(request.descricao());
        entity.setDataAquisicao(request.dataAquisicao());
        entity.setValorAquisicao(request.valorAquisicao());
        entity.setDataCriacao(request.dataCriacao());
        // Aqui você buscaria Categoria e NotaFiscal pelos UUIDs
        // entity.setCategoria(categoriaRepository.findById(request.uuid_categoria()).orElseThrow());
        // entity.setNotaFiscal(notaFiscalRepository.findById(request.uuid_notaFiscalId()).orElseThrow());
        return entity;
    }

    //update
    public PatrimonioGeral toEntity(PatrimonioGeralUpdateRequest request) {
        PatrimonioGeral entity = new PatrimonioGeral();
        entity.setDescricao(request.descricao());
        entity.setDataAquisicao(request.dataAquisicao());
        entity.setValorAquisicao(request.valorAquisicao());
        entity.setDataCriacao(request.dataCriacao());
        return entity;
    }


    // Converte entidade para DTO (record)
    public PatrimonioGeralDTO toDto(PatrimonioGeral entity) {
        return new PatrimonioGeralDTO(
            entity.getUuid(),           // 1. UUID id
            entity.getDescricao(),      // 2. String descricao
            entity.getDataAquisicao(),   // 3. LocalDate dataAquisicao
            entity.getValorAquisicao(),  // 4. BigDecimal valorAquisicao
            entity.getDataCriacao(),
            
            // 5. CategoriaDTO categoria (A "mágica" para o front)
            entity.getCategoria() != null ? new CategoriaEspecificoDTO(
                entity.getCategoria().getUuid(), 
                entity.getCategoria().getNome()
            ) : null,
            
            mapNotaFiscal(entity.getNotaFiscal()),

            //tentando de novo
            entity.isPatrimonioAutomatico()
        );
    }
    
    private NotaFiscalDTO mapNotaFiscal(NotaFiscal entity) {
        if (entity == null) return null;

        return new NotaFiscalDTO(
            entity.getUuid(),
            entity.getCodigoNota(),
            entity.getFornecedor(),
            entity.getCnpj(),
            entity.getValorTotalNota(),
            entity.getDataEmissao(),
            entity.getStatus(),
            entity.getNotaFiscalUrl(),
            entity.getDataCriacao(),
            entity.getChaveAcesso(),
            entity.isCriadoAutomatico()
          
        );
    }

    
}
