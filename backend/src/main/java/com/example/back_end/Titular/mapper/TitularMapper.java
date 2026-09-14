package com.example.back_end.Titular.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.back_end.Comodato.Comodato;
import com.example.back_end.Comodato.ComodatoResumoResponse;
import com.example.back_end.Comodato.PatrimonioResumoResponse;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;
import com.example.back_end.Titular.domain.Titular;
import com.example.back_end.Titular.dto.ComodatoByTitular;
import com.example.back_end.Titular.dto.TitularDto;
import com.example.back_end.Titular.dto.TitularRequestDto;
import com.example.back_end.Titular.dto.TitularUpdate;

@Mapper(componentModel = "spring")
public interface TitularMapper {

    @Mapping(target = "comodatos", source = "comodatos")
    TitularRequestDto toRequestDto(Titular titular);
    
    TitularDto toDto(Titular titular);

    TitularUpdate toDtoo(Titular titular);

    ComodatoResumoResponse toResumo(Comodato entity);

    @Mapping(target = "descricao", source = "patrimonioGeral.descricao")
    PatrimonioResumoResponse toPatrimonioResumo(PatrimonioEspecifico patrimonio);

    List<ComodatoResumoResponse> toResumoList(List<Comodato> list);

    ComodatoByTitular toComodatoByTitular(Titular titular);
    
    @Mapping(target = "comodatos", ignore = true)
    Titular toEntity(TitularDto dto);

    @Mapping(target = "cpf", ignore = true)
    @Mapping(target = "comodatos", ignore = true)
    Titular toEntity(TitularRequestDto dto);

    Titular toEntityy(Titular titularExistente);
}