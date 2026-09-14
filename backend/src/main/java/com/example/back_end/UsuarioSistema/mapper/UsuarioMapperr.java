package com.example.back_end.UsuarioSistema.mapper;

import org.mapstruct.Mapper;

import com.example.back_end.UsuarioSistema.domain.UsuarioSistema;
import com.example.back_end.UsuarioSistema.dto.UsuarioDTO;

@Mapper
public interface UsuarioMapperr {
    
    UsuarioDTO toDtoo(UsuarioSistema entity);
}
