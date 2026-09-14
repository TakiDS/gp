package com.example.back_end.Infra.sequence;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;


public interface SequenciaRepository extends JpaRepository<Sequencia, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE) //pra alterar os valores de num de patrimonio simultaneamente em qualquer usuario que esteja realizando algo no sistema
    Optional<Sequencia> findByChave(String chave);


    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Sequencia s WHERE s.chave = :chave")
    Optional<Sequencia> findByChaveComBloqueio(@Param("chave") String chave);
}
