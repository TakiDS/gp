package com.example.back_end.UsuarioSistema.repository;

import com.example.back_end.UsuarioSistema.domain.UsuarioRole;
import com.example.back_end.UsuarioSistema.domain.UsuarioSistema;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsuarioSistemaRepository extends JpaRepository<UsuarioSistema, UUID> {
    Optional<UsuarioSistema> findByLogin(String login);
    Optional<UsuarioSistema> findByCodigoRecuperacao(String codigoRecuperacao);
    List<UsuarioSistema> findByRole(UsuarioRole role);

    @Query("""
            SELECT DISTINCT u FROM UsuarioSistema u
            WHERE (:termoBusca IS NULL 
            OR u.nome LIKE %:termoBusca% 
            OR u.login LIKE %:termoBusca%)
        """)
    Page<UsuarioSistema> consultar(@Param("termoBusca") String termoBusca, Pageable paginacao);
}