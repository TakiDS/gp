package com.example.back_end.Historico.mapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.example.back_end.Historico.domain.Historico;
import com.example.back_end.Historico.dto.HistoricoDto;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface HistoricoMapper {

    @Mapping(source = "usuarioResponsavel.uuid", target = "usuarioId")
    @Mapping(source = "usuarioResponsavel.nome", target = "nomeUsuarioResponsavel")
    @Mapping(source = "detalhesJson", target = "detalhes")
    HistoricoDto toDto(Historico historico);

    // Método auxiliar para converter a String JSON do banco em lista para o Response
    default List<Map<String, Object>> stringJsonToList(String detalhesJson) {
        if (detalhesJson == null || detalhesJson.isEmpty()) return new ArrayList<>();
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper()
                    .readValue(detalhesJson, new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}