package com.example.back_end.Comodato.termos;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TermoRepository extends JpaRepository<Termo, UUID> {

    // Busca todos os termos gerados para um Comodato ou Patrimônio específico
    List<Termo> findByReferenciaId(UUID refernciaId);
    
    // Busca termos por tipo (ex: todos os de BAIXA)
    List<Termo> findByTipoTermo(TipoTermoEnum tipoTermo);

    Optional<Termo> findFirstByReferenciaIdOrderByDataCriacaoDesc(UUID referenciaId);
}
