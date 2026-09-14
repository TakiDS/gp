package com.example.back_end.NfeConsulta;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "certificados")
public class CertificadoDigital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    private byte[] arquivoPfx;

    private String senha;

    // Construtor vazio obrigatório do JPA
    public CertificadoDigital() {}

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public byte[] getArquivoPfx() { return arquivoPfx; }
    public void setArquivoPfx(byte[] arquivoPfx) { this.arquivoPfx = arquivoPfx; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
}