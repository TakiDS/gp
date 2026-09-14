package com.example.back_end.UsuarioSistema.mapper;


import com.example.back_end.UsuarioSistema.domain.UsuarioRole;
import com.example.back_end.UsuarioSistema.domain.UsuarioSistema;
import com.example.back_end.UsuarioSistema.dto.CadastroDto;
import com.example.back_end.UsuarioSistema.dto.UsuarioDTO;

import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

    public UsuarioSistema toEntity(CadastroDto dto) {
        
        UsuarioRole roleParaSalvar = (dto.role() != null) ? dto.role() : UsuarioRole.USER;

        return new UsuarioSistema(
            dto.email(),
            dto.senha(),
            dto.nome(),
            roleParaSalvar
        );
    }
}