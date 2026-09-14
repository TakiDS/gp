package com.example.back_end.Comodato;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;

@Mapper(componentModel = "spring")
public interface ComodatoMapper {

    @Mapping(target = "patrimonios", source = "patrimonios")
    @Mapping(target = "titularId", source = "titular.uuid")
    @Mapping(target = "nome", source = "titular.nome")
    @Mapping(target = "email", source = "titular.email")
    ComodatoResponse toResponse(Comodato entity);

    @Mapping(target = "uuid", source = "uuid")
    @Mapping(target = "descricao", source = "patrimonioGeral.descricao")
    PatrimonioResumoResponse toPatrimonioResumo(PatrimonioEspecifico entity);

    @Mapping(target = "patrimonios", ignore = true)
    Comodato toEntity(ComodatoDto dto);

    Comodato toEntity(ComodatoStatusUpdateRequest dto);

    ComodatoDto toDto(Comodato entity);

    ComodatoUpdate toDtoo(Comodato entity);

    ComodatoDados toDtooo(Comodato entity);

    ComodatoRetorno toDtoooo(Comodato entity);
}
