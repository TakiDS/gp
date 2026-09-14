package com.example.back_end.Localizacao;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LocalizacaoRepository extends JpaRepository<Localizacao, UUID>{

    // O EntityGraph força o JOIN para buscar a lista de patrimônios de uma só vez
    @EntityGraph(attributePaths = {"patrimonio"})
    Optional<Localizacao> findWithPatrimonioByUuid(UUID uuid);
    
    @Query("""
        SELECT DISTINCT l FROM Localizacao l
        WHERE :termoBusca IS NULL
        OR l.local LIKE %:termoBusca%
        OR str(l.totalPatrimonio) LIKE %:termoBusca%
    """)
    Page<Localizacao> consultar(@Param("termoBusca") String termoBusca, Pageable paginacao);

    boolean existsByLocalIgnoreCase(String local);

    boolean existsByLocalIgnoreCaseAndUuidNot(String local, UUID uuid);



}
