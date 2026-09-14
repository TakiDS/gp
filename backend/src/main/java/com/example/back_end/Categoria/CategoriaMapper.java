package com.example.back_end.Categoria;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.back_end.PatrimonioGeral.PatrimonioGeralMapper;

@Mapper(componentModel = "spring", uses = PatrimonioGeralMapper.class)
public interface CategoriaMapper {

    CategoriaDTO toDto(Categoria categoria);

    CategoriaResponseDto toDtoo(Categoria entity);
    
    @Mapping(target = "patrimonioGeral", ignore = true)
    Categoria toEntity(CategoriaResponseDto dto);

    @Mapping(target = "patrimonioGeral", ignore = true)
    Categoria toEntityy(CategoriaDTO dto); 

}