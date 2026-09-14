package com.example.back_end.Infra.seguranca.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.back_end.UsuarioSistema.domain.StatusUsuario;
import com.example.back_end.UsuarioSistema.domain.UsuarioRole;
import com.example.back_end.UsuarioSistema.domain.UsuarioSistema;
import com.example.back_end.UsuarioSistema.repository.UsuarioSistemaRepository;

class DataInitializerTest {

    private final UsuarioSistemaRepository repository = org.mockito.Mockito.mock(UsuarioSistemaRepository.class);
    private final PasswordEncoder passwordEncoder = org.mockito.Mockito.mock(PasswordEncoder.class);

    @Test
    void createsAdminOnlyFromConfiguredCredentials() throws Exception {
        when(repository.findByLogin("admin@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("senha-segura-123")).thenReturn("hash");
        DataInitializer initializer = new DataInitializer(
                repository, passwordEncoder, "admin@example.com", "senha-segura-123", "Administrador");

        initializer.run();

        ArgumentCaptor<UsuarioSistema> captor = ArgumentCaptor.forClass(UsuarioSistema.class);
        verify(repository).save(captor.capture());
        assertEquals("admin@example.com", captor.getValue().getLogin());
        assertEquals("hash", captor.getValue().getSenha());
        assertEquals(UsuarioRole.ADMIN, captor.getValue().getRole());
        assertEquals(StatusUsuario.ATIVO, captor.getValue().getStatus());
    }

    @Test
    void doesNotOverwriteExistingAdmin() throws Exception {
        when(repository.findByLogin("admin@example.com")).thenReturn(Optional.of(new UsuarioSistema()));
        DataInitializer initializer = new DataInitializer(
                repository, passwordEncoder, "admin@example.com", "senha-segura-123", "Administrador");

        initializer.run();

        verify(repository, never()).save(any());
    }

    @Test
    void rejectsWeakBootstrapPassword() {
        DataInitializer initializer = new DataInitializer(
                repository, passwordEncoder, "admin@example.com", "curta", "Administrador");

        assertThrows(IllegalStateException.class, initializer::run);
    }
}
