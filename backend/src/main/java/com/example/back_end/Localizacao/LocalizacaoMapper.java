package com.example.back_end.Localizacao;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecificoMapper;

@Mapper(componentModel = "spring", uses = PatrimonioEspecificoMapper.class)
public interface LocalizacaoMapper {

    PatrimonioEspecificoPorLocalDto toDto(Localizacao entity);
    LocalizacaoResponseDto toDtoo(Localizacao entity);
    LocalizacaoUpdateDto toDtooo(Localizacao entity);

    @Mapping(target = "patrimonio", ignore = true)
    Localizacao toEntity(PatrimonioEspecificoPorLocalDto dto);
    Localizacao toEntityy(LocalizacaoResponseDto dto);
    Localizacao toEntityyy(LocalizacaoUpdateDto dto);
}
