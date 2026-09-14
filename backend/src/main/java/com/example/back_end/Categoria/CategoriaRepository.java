package com.example.back_end.Categoria;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CategoriaRepository extends JpaRepository<Categoria, UUID>{

    Page<Categoria> findByNomeContainingIgnoreCase(String termoBusca, Pageable paginacao);

    @Query("SELECT COUNT(pe) " +
       "FROM PatrimonioEspecifico pe " +
       "JOIN pe.patrimonioGeral pg " +
       "WHERE pg.categoria.uuid = :uuidCategoria")

    int countByCategoria(@Param("uuidCategoria") UUID uuidCategoria);

    boolean existsByNomeIgnoreCase(String nome);

    boolean existsByNomeIgnoreCaseAndUuidNot(String nome, UUID uuid);

    boolean existsByPatrimonioGeralUuid(UUID uuid);

} 