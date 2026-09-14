package com.example.back_end.Titular.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.back_end.Titular.domain.StatusPerfil;
import com.example.back_end.Titular.domain.Titular;

@Repository
public interface TitularRepository extends JpaRepository<Titular, UUID> {

    @Query(value = """
        SELECT DISTINCT t FROM Titular t
        LEFT JOIN FETCH t.comodatos
        WHERE (
            :termoBusca IS NULL 
            OR LOWER(t.nome) LIKE LOWER(CONCAT('%', :termoBusca, '%'))
            OR LOWER(t.email) LIKE LOWER(CONCAT('%', :termoBusca, '%'))
        )
        AND (:statusPerfil IS NULL OR t.statusPerfil = :statusPerfil)
        """,
        countQuery = """
        SELECT count(t) FROM Titular t
        WHERE (
            :termoBusca IS NULL 
            OR LOWER(t.nome) LIKE LOWER(CONCAT('%', :termoBusca, '%'))
            OR LOWER(t.email) LIKE LOWER(CONCAT('%', :termoBusca, '%'))
        )
        AND (:statusPerfil IS NULL OR t.statusPerfil = :statusPerfil)
        """)
    Page<Titular> consultar(
        @Param("termoBusca") String termoBusca, 
        @Param("statusPerfil") StatusPerfil statusPerfil, 
        Pageable paginacao
    );
    
    boolean existsByEmail(String email);
    
    Optional<Titular> findByEmail(String email);

    @Query("""
    SELECT t FROM Titular t
    LEFT JOIN FETCH t.comodatos
    WHERE t.uuid = :uuid
    """)
    Optional<Titular> findByIdWithComodatos(UUID uuid);

    @Query(value = "SELECT DISTINCT t FROM Titular t LEFT JOIN FETCH t.comodatos",
    countQuery = "SELECT count(t) FROM Titular t")
    Page<Titular> findAllWithComodatos(Pageable pageable);
    
}