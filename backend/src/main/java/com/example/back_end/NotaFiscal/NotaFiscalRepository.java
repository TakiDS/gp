package com.example.back_end.NotaFiscal;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotaFiscalRepository extends JpaRepository<NotaFiscal, UUID> {

    boolean existsByChaveAcesso(String chaveAcesso);

    @Query("SELECT n FROM NotaFiscal n WHERE " +
           "LOWER(n.fornecedor) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(n.codigoNota) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "n.cnpj LIKE CONCAT('%', :termo, '%')")
    Page<NotaFiscal> pesquisar(@Param("termo") String termo, Pageable paginacao);
    
    // Para o filtro de "Todos os fornecedores" da sua imagem:
    Page<NotaFiscal> findByFornecedor(String fornecedor, Pageable paginacao);


    @Query("SELECT n FROM NotaFiscal n WHERE " +
           "(:status IS NULL OR n.status = :status) AND " +
           "(cast(:dataInicio as date) IS NULL OR n.dataEmissao >= :dataInicio) AND " +
           "(cast(:dataFim as date) IS NULL OR n.dataEmissao <= :dataFim) AND " +
           "(:termoBusca IS NULL OR " +
           "  LOWER(n.fornecedor) LIKE LOWER(CONCAT('%', :termoBusca, '%')) OR " +
           "  n.cnpj LIKE CONCAT('%', :termoBusca, '%') OR " +
           "  n.codigoNota LIKE CONCAT('%', :termoBusca, '%') OR " +
           "  n.chaveAcesso LIKE CONCAT('%', :termoBusca, '%') " +
           ")")
    Page<NotaFiscal> findByFiltros(
            @Param("termoBusca") String termoBusca,
            @Param("status") StatusNota status,
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim,
            Pageable paginacao
    );

    
}
