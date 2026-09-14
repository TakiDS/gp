package com.example.back_end.UsuarioSistema.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;

import java.lang.reflect.Method;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;

import com.example.back_end.Infra.seguranca.service.TokenService;
import com.example.back_end.UsuarioSistema.domain.UsuarioRole;
import com.example.back_end.UsuarioSistema.dto.CadastroDto;
import com.example.back_end.UsuarioSistema.service.UsuarioService;

class AutenticacaoControllerTest {

    private final AuthenticationManager authenticationManager = org.mockito.Mockito.mock(AuthenticationManager.class);
    private final TokenService tokenService = org.mockito.Mockito.mock(TokenService.class);
    private final UsuarioService usuarioService = org.mockito.Mockito.mock(UsuarioService.class);
    private final AutenticacaoController controller = new AutenticacaoController(
            authenticationManager, tokenService, usuarioService);

    @Test
    void registerDefaultsToUserRole() {
        CadastroDto cadastro = new CadastroDto(
                "Pessoa", "pessoa@example.com", "Senha-forte-123!", null);

        var response = controller.register(cadastro);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(usuarioService).criarUsuarioInterno(cadastro, UsuarioRole.USER);
    }

    @Test
    void registerRequiresAdminAsDefenseInDepth() throws Exception {
        Method method = AutenticacaoController.class.getMethod("register", CadastroDto.class);

        assertEquals("hasRole('ADMIN')", method.getAnnotation(PreAuthorize.class).value());
    }
}
