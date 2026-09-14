package com.example.back_end.PatrimonioEspecifico;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.back_end.Categoria.Categoria;
import com.example.back_end.Dashboard.CategoriaValorDTO;
import com.example.back_end.Localizacao.Localizacao;
import com.example.back_end.PatrimonioGeral.PatrimonioGeral;

import jakarta.transaction.Transactional;

public interface PatrimonioEspecificoRepository extends JpaRepository<PatrimonioEspecifico, UUID> {

    @Query("""
        SELECT DISTINCT e
        FROM PatrimonioEspecifico e
        LEFT JOIN FETCH e.localizacao l
        LEFT JOIN FETCH e.patrimonioGeral pg
        LEFT JOIN pg.notaFiscal nf 
        WHERE (:categoria IS NULL OR pg.categoria.nome = :categoria)
        AND (:estado IS NULL OR e.estado = :estado)
        AND (:local IS NULL OR l.local = :local)
        AND (
            :possuiNota IS NULL 
            OR (:possuiNota = true AND nf IS NOT NULL) 
            OR (:possuiNota = false AND nf IS NULL)
        )
        AND (
            :termoBusca IS NULL
            OR e.numPatrimonio LIKE CONCAT('%', :termoBusca, '%')
            OR pg.descricao LIKE CONCAT('%', :termoBusca, '%')
        )
    """)
    Page<PatrimonioEspecifico> findByFiltros(
            @Param("categoria") String categoria,
            @Param("estado") EstadoEnum estado,
            @Param("local") String local,
            @Param("termoBusca") String termoBusca,
            @Param("possuiNota") Boolean possuiNota, // <-- Mudou para Boolean
            Pageable paginacao
    );
    
    Page<PatrimonioEspecifico> findByPatrimonioGeral(PatrimonioGeral geral, Pageable paginacao);

    @Modifying
    @Transactional
    @Query("UPDATE PatrimonioEspecifico e SET e.localizacao.id = :novoLocalId WHERE e.id IN :ids")
    void moverPatrimoniosEmMassaLocal(@Param("ids") List<UUID> ids, @Param("novoLocalId") UUID novoLocalId);

    //AREA DO DASHBOARD
    @Query("SELECT COUNT(e) FROM PatrimonioEspecifico e")
    long countTotal();

    @Query("SELECT SUM(pg.valorAquisicao) FROM PatrimonioEspecifico e JOIN e.patrimonioGeral pg")
    BigDecimal sumValorTotal();

    @Query("SELECT pg.categoria.nome, COUNT(e) FROM PatrimonioEspecifico e JOIN e.patrimonioGeral pg GROUP BY pg.categoria.nome")
    List<Object[]> countByCategoria();

    @Query("""
    SELECT new com.example.back_end.Dashboard.CategoriaValorDTO(pg.categoria.nome, SUM(pg.valorAquisicao)) FROM PatrimonioEspecifico e
    JOIN e.patrimonioGeral pg
    GROUP BY pg.categoria.nome
    """)
    List<CategoriaValorDTO> findValorTotalPorCategoria();

    @Query("SELECT COALESCE(SUM(pg.valorAquisicao), 0) FROM PatrimonioEspecifico pe JOIN pe.patrimonioGeral pg")
    BigDecimal sumValorTotalImobilizados();

    // Query genérica para contar por qualquer status que você passar
    @Query("SELECT COUNT(p) FROM PatrimonioEspecifico p WHERE p.estado = :estado")
    long countByStatus(@Param("estado") EstadoEnum estado);

    // Esta query conta os específicos onde o "Pai" (Geral) não possui "Nota Fiscal" vinculada
    @Query("SELECT COUNT(pe) FROM PatrimonioEspecifico pe WHERE pe.patrimonioGeral.notaFiscal IS NULL")
    long countPatrimoniosSemNota();

    @Query("SELECT COUNT(pe) FROM PatrimonioEspecifico pe "
            + "WHERE pe.patrimonioGeral.notaFiscal.uuid = :notaUuid")
    long countByNotaFiscalUuid(@Param("notaUuid") UUID notaUuid);

    // 1. Para o Gráfico de Rosca: Quantidade de patrimônios por cada status
    @Query("SELECT p.estado, COUNT(p) FROM PatrimonioEspecifico p GROUP BY p.estado")
    List<Object[]> countByStatusAgrupado();

// 2. Para o Gráfico de Barras: Valor total (do pai) somado por cada local (do filho)
    @Query("""
    SELECT l.local, SUM(pg.valorAquisicao) 
    FROM PatrimonioEspecifico pe 
    JOIN pe.localizacao l 
    JOIN pe.patrimonioGeral pg 
    GROUP BY l.local
""")
    List<Object[]> sumValorPorLocalAgrupado();

    // Calcula o valor total até uma data específica (para o percentual de crescimento)
    @Query("SELECT COALESCE(SUM(pg.valorAquisicao), 0) FROM PatrimonioEspecifico pe JOIN pe.patrimonioGeral pg WHERE pg.dataAquisicao <= :dataLimite")
    BigDecimal sumValorTotalImobilizadosAte(@Param("dataLimite") java.time.LocalDate dataLimite);

    //Teste por filtro
    // 1. Valor total com 4 filtros dinâmicos
    @Query("""
        SELECT COALESCE(SUM(pg.valorAquisicao), 0) FROM PatrimonioEspecifico pe 
        JOIN pe.patrimonioGeral pg 
        LEFT JOIN pe.localizacao loc
        WHERE (:localUuid IS NULL OR loc.uuid = :localUuid)
        AND (:estadoFiltro IS NULL OR pe.estado = :estadoFiltro)
        AND (cast(:dataInicio as date) IS NULL OR pg.dataAquisicao >= :dataInicio)
        AND (cast(:dataFim as date) IS NULL OR pg.dataAquisicao <= :dataFim)
    """)
    BigDecimal sumValorTotalFiltrado(
            @Param("localUuid") UUID localUuid,
            @Param("estadoFiltro") EstadoEnum estadoFiltro,
            @Param("dataInicio") java.time.LocalDate dataInicio,
            @Param("dataFim") java.time.LocalDate dataFim
    );

    // 2. Contagem total com 4 filtros dinâmicos
    @Query("""
        SELECT COUNT(pe) FROM PatrimonioEspecifico pe 
        JOIN pe.patrimonioGeral pg 
        LEFT JOIN pe.localizacao loc
        WHERE (:localUuid IS NULL OR loc.uuid = :localUuid)
        AND (:estadoFiltro IS NULL OR pe.estado = :estadoFiltro)
        AND (cast(:dataInicio as date) IS NULL OR pg.dataAquisicao >= :dataInicio)
        AND (cast(:dataFim as date) IS NULL OR pg.dataAquisicao <= :dataFim)
    """)
    long countTotalFiltrado(
            @Param("localUuid") UUID localUuid,
            @Param("estadoFiltro") EstadoEnum estadoFiltro,
            @Param("dataInicio") java.time.LocalDate dataInicio,
            @Param("dataFim") java.time.LocalDate dataFim
    );

    // 3. Contagem por status (Cards) + Filtro Global
    @Query("""
        SELECT COUNT(pe) FROM PatrimonioEspecifico pe 
        JOIN pe.patrimonioGeral pg 
        LEFT JOIN pe.localizacao loc
        WHERE pe.estado = :estadoCard
        AND (:localUuid IS NULL OR loc.uuid = :localUuid)
        AND (:estadoFiltro IS NULL OR pe.estado = :estadoFiltro)
        AND (cast(:dataInicio as date) IS NULL OR pg.dataAquisicao >= :dataInicio)
        AND (cast(:dataFim as date) IS NULL OR pg.dataAquisicao <= :dataFim)
    """)
    long countByStatusFiltrado(
            @Param("estadoCard") EstadoEnum estadoCard,
            @Param("estadoFiltro") EstadoEnum estadoFiltro,
            @Param("localUuid") UUID localUuid,
            @Param("dataInicio") java.time.LocalDate dataInicio,
            @Param("dataFim") java.time.LocalDate dataFim
    );

    // 4. Pendências sem nota fiscal com 4 filtros
    @Query("""
        SELECT COUNT(pe) FROM PatrimonioEspecifico pe 
        JOIN pe.patrimonioGeral pg 
        LEFT JOIN pe.localizacao loc
        WHERE pg.notaFiscal IS NULL
        AND (:localUuid IS NULL OR loc.uuid = :localUuid)
        AND (:estadoFiltro IS NULL OR pe.estado = :estadoFiltro)
        AND (cast(:dataInicio as date) IS NULL OR pg.dataAquisicao >= :dataInicio)
        AND (cast(:dataFim as date) IS NULL OR pg.dataAquisicao <= :dataFim)
    """)
    long countPendenciasNfFiltrado(
            @Param("localUuid") UUID localUuid,
            @Param("estadoFiltro") EstadoEnum estadoFiltro,
            @Param("dataInicio") java.time.LocalDate dataInicio,
            @Param("dataFim") java.time.LocalDate dataFim
    );

    @Query("SELECT p.localizacao.local, p.estado, COUNT(p) FROM PatrimonioEspecifico p GROUP BY p.localizacao.local, p.estado")
    List<Object[]> countStatusPorLocalAgrupado();

    /////////////////////////////////
    @Query("""
    SELECT DISTINCT pe FROM PatrimonioEspecifico pe
    LEFT JOIN pe.patrimonioGeral pg
    LEFT JOIN pg.categoria c
    WHERE pe.localizacao = :localizacao
        AND (
                :termoBusca IS NULL
                OR LOWER(pe.numPatrimonio) LIKE LOWER(CONCAT('%', :termoBusca, '%'))
                OR LOWER(pg.descricao) LIKE LOWER(CONCAT('%', :termoBusca, '%'))
                OR LOWER(c.nome) LIKE LOWER(CONCAT('%', :termoBusca, '%'))
        )
    """)
    Page<PatrimonioEspecifico> findByLocalizacao(
            @Param("localizacao") Localizacao localizacao,
            @Param("termoBusca") String termoBusca,
            Pageable paginacao
    );

    @Query("""
        SELECT p.etiquetaUrlPreta FROM PatrimonioEspecifico p WHERE p.etiquetaUrlPreta IS NOT NULL
        UNION
        SELECT p.etiquetaUrlBranca FROM PatrimonioEspecifico p WHERE p.etiquetaUrlBranca IS NOT NULL
        """)
    List<String> findAllEtiquetaUrls();

    boolean existsByNumSerie(String numSerie);

    // Verifica se existe registro com o numSerie, excluindo o ID atual (para edição)
    boolean existsByNumSerieAndUuidNot(String numSerie, UUID uuid);

    @Query("""
        SELECT pe FROM PatrimonioEspecifico pe
        JOIN pe.patrimonioGeral pg
        WHERE pg.categoria = :categoria
        AND (:termo IS NULL OR :termo = '' 
            OR pe.numPatrimonio LIKE %:termo% 
            OR pg.descricao LIKE %:termo%)
        """)
    Page<PatrimonioEspecifico> findByTermoBusca(
            @Param("categoria") Categoria categoria,
            @Param("termo") String termo,
            Pageable paginacao
    );

    //pro termo de auditoria
    @Query("SELECT p FROM PatrimonioEspecifico p WHERE p.localizacao = :localizacao AND p.patrimonioGeral.categoria = :categoria")
    List<PatrimonioEspecifico> findByLocalizacaoAndCategoria(Localizacao localizacao, Categoria categoria);
}
