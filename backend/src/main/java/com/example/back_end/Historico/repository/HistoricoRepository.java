package com.example.back_end.Historico.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.back_end.Historico.domain.Historico;

public interface HistoricoRepository extends JpaRepository<Historico, Long> {
// Busca todos os logs que pertençam a qualquer um dos IDs fornecidos, ordenando pelo mais recente
    List<Historico> findByIdEntidadeAfetadaInOrderByDataHoraDesc(List<String> ids);
    //N
    Optional<Historico> findByIdEntidadeAfetada(String idEntidadeAfetada);
}