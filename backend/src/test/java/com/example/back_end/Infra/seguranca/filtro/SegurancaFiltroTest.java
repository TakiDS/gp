package com.example.back_end.Infra.seguranca.filtro;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import com.example.back_end.Infra.seguranca.service.TokenService;
import com.example.back_end.UsuarioSistema.domain.UsuarioRole;
import com.example.back_end.UsuarioSistema.domain.UsuarioSistema;
import com.example.back_end.UsuarioSistema.repository.UsuarioSistemaRepository;

class SegurancaFiltroTest {

    private final TokenService tokenService = org.mockito.Mockito.mock(TokenService.class);
    private final UsuarioSistemaRepository repository = org.mockito.Mockito.mock(UsuarioSistemaRepository.class);
    private final SegurancaFiltro filter = new SegurancaFiltro(tokenService, repository);

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void authenticatesBearerTokenEvenOnAuthRoute() throws Exception {
        UsuarioSistema admin = new UsuarioSistema("admin@example.com", "hash", "Admin", UsuarioRole.ADMIN);
        when(tokenService.validateToken("token-valido")).thenReturn("admin@example.com");
        when(repository.findByLogin("admin@example.com")).thenReturn(Optional.of(admin));
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/auth/register");
        request.addHeader("Authorization", "Bearer token-valido");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean called = new AtomicBoolean(false);

        filter.doFilter(request, response, (req, res) -> called.set(true));

        assertTrue(called.get());
        assertSame(admin, SecurityContextHolder.getContext().getAuthentication().getPrincipal());
    }

    @Test
    void rejectsInvalidBearerToken() throws Exception {
        when(tokenService.validateToken("invalido")).thenReturn("");
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/usuarios/me");
        request.addHeader("Authorization", "Bearer invalido");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean called = new AtomicBoolean(false);

        filter.doFilter(request, response, (req, res) -> called.set(true));

        assertFalse(called.get());
        assertEquals(401, response.getStatus());
    }

    @Test
    void letsSecurityChainDecideWhenTokenIsAbsent() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/public/patrimonio/123");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean called = new AtomicBoolean(false);

        filter.doFilter(request, response, (req, res) -> called.set(true));

        assertTrue(called.get());
    }
}
