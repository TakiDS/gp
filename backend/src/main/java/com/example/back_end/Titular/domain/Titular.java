package com.example.back_end.Titular.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.example.back_end.Comodato.Comodato;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "titular")
public class Titular {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "uuid_titular", updatable = false, nullable = false)
    private UUID uuid;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "cpf", unique = true, nullable = false, length = 14)
    private String cpf;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_perfil", nullable = false)
    private PerfilEnum tipoPerfil;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_perfil", nullable = false)
    private StatusPerfil statusPerfil = StatusPerfil.ATIVO;

    @OneToMany(mappedBy = "titular", fetch = FetchType.LAZY)
    private List<Comodato> comodatos = new ArrayList<>();

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public PerfilEnum getTipoPerfil() {
        return tipoPerfil;
    }

    public void setTipoPerfil(PerfilEnum tipoPerfil) {
        this.tipoPerfil = tipoPerfil;
    }

    public StatusPerfil getStatusPerfil() {
        return statusPerfil;
    }

    public void setStatusPerfil(StatusPerfil statusPerfil) {
        this.statusPerfil = statusPerfil;
    }

    public List<Comodato> getComodatos() {
        return comodatos;
    }

    public void setComodatos(List<Comodato> comodatos) {
        this.comodatos = comodatos;
    }

    public void validarPodeGerarComodato() {
        if (!statusPerfil.permiteComodato()) {
            throw new IllegalStateException("Titular está inativo.");
        }

        if (!tipoPerfil.permiteComodato()) {
            throw new IllegalStateException("Tipo de perfil não permite comodato.");
        }
    }

    @PrePersist
    public void prePersist() {
        if (statusPerfil == null) {
            statusPerfil = StatusPerfil.ATIVO;
        }
    }
}