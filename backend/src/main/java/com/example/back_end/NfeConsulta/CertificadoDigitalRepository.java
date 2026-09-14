package com.example.back_end.NfeConsulta;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CertificadoDigitalRepository extends JpaRepository<CertificadoDigital, Long> {
}
