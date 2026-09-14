package com.example.back_end.Comodato;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;


public interface ComodatoRepository extends JpaRepository <Comodato, UUID> {

    @Query("""
        SELECT c FROM Comodato c
        JOIN c.titular t
        WHERE
        (:termoBusca IS NULL OR
        LOWER(t.nome) LIKE LOWER(CONCAT('%', :termoBusca, '%')) OR
        LOWER(t.email) LIKE LOWER(CONCAT('%', :termoBusca, '%')))
        AND
        (:estado IS NULL OR c.estado = :estado)
    """)
    Page<Comodato> consultar(
            @Param("termoBusca") String termoBusca,
            @Param("estado") StatusEnum estado,
            Pageable paginacao
    );
    
    // boolean existsByPatrimonioEspecificoUuidAndEstadoNot(UUID patrimonioId, StatusEnum estado); //nao faz mais sentido

    Page<Comodato> findByEstadoIn(@Param ("estado") List<StatusEnum> estados, Pageable paginacao);

    //verificar titular com estado pendente ou atrasado (verificar isso com calma)
    boolean existsByTitularUuidAndEstadoIn(UUID uuid, List<StatusEnum> estados);
    
    Optional<Comodato> findByTokenAssinatura(String tokenAssinatura);

    @Query("SELECT c FROM Comodato c " +
       "JOIN FETCH c.patrimonios p " +
       "JOIN FETCH p.patrimonioGeral " + // Carrega o "pai" do específico
       "WHERE c.uuid = :uuid")
    Optional<Comodato> findByIdParaTermo(@Param("uuid") UUID uuid);

    List<Comodato> findByTitularUuid(UUID uuid);


    //Criar um metodo especifico pra isso
    List<Comodato> findTop2ByEstadoOrderByDataFimEsperado(StatusEnum status);
   
    @Query("SELECT c FROM Comodato c JOIN c.patrimonios p WHERE p.uuid = :patrimonioUuid AND c.estado IN ('PENDENTE', 'ATRASADO', 'ASSINATURA')")
    Optional<Comodato> findAtivoByPatrimonioUuid(@Param("patrimonioUuid") UUID patrimonioUuid);

}
