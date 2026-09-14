package com.example.back_end.PatrimonioEspecifico;

import java.util.UUID;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

import com.example.back_end.Comodato.ComodatoMapper;
import com.example.back_end.Localizacao.LocalizacaoMapper;
import com.example.back_end.PatrimonioGeral.PatrimonioGeral;
import com.example.back_end.PatrimonioGeral.PatrimonioGeralMapper;

@Mapper(componentModel = "spring", uses = {LocalizacaoMapper.class, PatrimonioGeralMapper.class, ComodatoMapper.class})
public abstract class PatrimonioEspecificoMapper {

    // Injetamos os mappers via Spring para evitar o erro de 'null' e ambiguidade
    @Autowired
    protected LocalizacaoMapper localizacaoMapper;

    @Autowired
    protected PatrimonioGeralMapper patrimonioGeralMapper;

    @Autowired
    protected ComodatoMapper comodatoMapper;

    // Métodos abstratos: o MapStruct implementará automaticamente
    public abstract PatrimonioEspecificoDto toDto(PatrimonioEspecifico entity);
    
    public abstract PatrimonioEspecificoResponse toDtoo(PatrimonioEspecifico entity);

    /**
     * Agora o Spring injeta as dependências e o MapStruct gerencia o ciclo de vida.
     * Isso resolve o erro de 'UnsatisfiedDependencyException'.
     */
    public PatrimonioEspecificoResponse toDtooSemHistorico(PatrimonioEspecifico entity, String urlTermo) {
        if (entity == null) return null;

        var comodato = entity.getComodato();
        var comodatoDto = (comodato != null && comodato.getEstado().isAtivo())
            ? comodatoMapper.toDtooo(comodato)
            : null;

        return new PatrimonioEspecificoResponse(
            entity.getUuid(),
            entity.getNumPatrimonio(),
            entity.getNumSerie(),
            entity.getEstado(),
            // Usamos os beans injetados corretamente
            localizacaoMapper.toDtoo(entity.getLocalizacao()), 
            patrimonioGeralMapper.toDto(entity.getPatrimonioGeral()),
            entity.getEtiquetaUrlPreta(), 
            entity.getEtiquetaUrlBranca(),
            comodatoDto,
            urlTermo
            //entity.getPatrimonioGeral().isPatrimonioAutomatico() ele pega o valor dedfault por algum motivo
        );
    }

    @Mapping(target = "comodato", ignore = true)
    public abstract PatrimonioEspecifico toEntity(PatrimonioEspecificoDto dto);

    public abstract PatrimonioEspecifico toEntityy(PatrimonioEspecificoResponse dto);

    @org.mapstruct.Named("mapIdToPatrimonioGeral")
    protected PatrimonioGeral mapIdToPatrimonioGeral(UUID uuid) {
        if (uuid == null) return null;
        PatrimonioGeral geral = new PatrimonioGeral();
        geral.setUuid(uuid);
        return geral;
    }
}