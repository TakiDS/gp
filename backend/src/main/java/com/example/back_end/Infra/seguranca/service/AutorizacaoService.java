package com.example.back_end.Infra.seguranca.service;

import com.example.back_end.UsuarioSistema.repository.UsuarioSistemaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AutorizacaoService implements UserDetailsService {

    private final UsuarioSistemaRepository repository;

    public AutorizacaoService(UsuarioSistemaRepository repository) {
        this.repository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        return repository.findByLogin(username)
        .orElseThrow(() -> new UsernameNotFoundException(
            "Usuário não encontrado com o email: " + username
        ));
    }
}