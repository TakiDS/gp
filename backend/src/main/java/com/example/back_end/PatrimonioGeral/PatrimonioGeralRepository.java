package com.example.back_end.PatrimonioGeral;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.back_end.Categoria.Categoria;

import jakarta.transaction.Transactional;

@Repository
public interface PatrimonioGeralRepository extends JpaRepository<PatrimonioGeral, UUID> {

    // Carrega todos os patrimônios e suas respectivas categorias em uma única consulta SQL
    @Query("SELECT p FROM PatrimonioGeral p LEFT JOIN FETCH p.categoria")
    Page<PatrimonioGeral> findAllWithCategoria(Pageable paginacao);

    // Busca um patrimônio específico garantindo que a categoria venha junto
    @Query("SELECT p FROM PatrimonioGeral p LEFT JOIN FETCH p.categoria WHERE p.uuid = :uuid")
    Optional<PatrimonioGeral> findByUuidWithCategoria(@Param("uuid") UUID uuid);

    Page<PatrimonioGeral> findByCategoria(Categoria categoria, Pageable paginacao);

    @Modifying
    @Transactional
    @Query("UPDATE PatrimonioGeral p SET p.categoria.id = :novoCategoriaId WHERE p.id IN :ids")
    void moverPatrimoniosEmMassaCategoria(@Param("ids") List<UUID> ids, @Param("novoCategoriaId") UUID novoCategoriaId);


}

