package com.example.back_end.PatrimonioEspecifico;

import java.time.LocalDateTime;
import java.util.UUID;

import com.example.back_end.Comodato.Comodato;
import com.example.back_end.Localizacao.Localizacao;
import com.example.back_end.PatrimonioGeral.PatrimonioGeral;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "patrimonio_especificado")
public class PatrimonioEspecifico {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "uuid_patrimonioEspecificado", updatable = false, nullable = false)
    private UUID uuid;

    @Column(name = "num_patrimonio", updatable = false)
    private String numPatrimonio;

    @Column(name = "num_serie", nullable = true, updatable = true, unique = true)
    private String numSerie;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_conservacao")
    private EstadoEnum estado;

    // @Column(name = "etiqueta_url") //alterar o nullable dps
    // private String etiquetaUrl;

    @Column(name = "etiqueta_url_preta")
    private String etiquetaUrlPreta;

    @Column(name = "etiqueta_url_branca")
    private String etiquetaUrlBranca;

    @Column(name = "termoUrl", nullable = true)
    private String termoUrl;

    //Data de Criação para ordenamento
    @Column(name="data_criacao")
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "uuid_localizacao", nullable = true)
    private Localizacao localizacao;

    // @Transient //so pra leitura do comodato atual
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comodato_id")
    private Comodato comodato;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patrimonio_geral_id")
    @JsonIgnore
    private PatrimonioGeral patrimonioGeral;

    // @OneToMany(mappedBy = "patrimonio")
    // private List<ItemComodato> historico;

    
    private String estadoFinalComodato;

    public String getEstadoFinalComodato() {
        return estadoFinalComodato;
    }

    public void setEstadoFinalComodato(String estadoFinalComodato) {
        this.estadoFinalComodato = estadoFinalComodato;
    }

    // Getters e Setters ...
    public PatrimonioGeral getPatrimonioGeral() {
        return patrimonioGeral;
    }

    public void setPatrimonioGeral(PatrimonioGeral patrimonioGeral) {
        this.patrimonioGeral = patrimonioGeral;
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public String getNumPatrimonio() {
        return numPatrimonio;
    }

    public void setNumPatrimonio(String numPatrimonio) {
        this.numPatrimonio = numPatrimonio;
    }

    public String getNumSerie() {
        return numSerie;
    }

    public void setNumSerie(String numSerie) {
        this.numSerie = numSerie;
    }

    public EstadoEnum getEstado() {
        return estado;
    }

    public void setEstado(EstadoEnum estado) {
        this.estado = estado;
    }

    // public String getEtiquetaUrl() {
    //     return etiquetaUrl;
    // }

    // public void setEtiquetaUrl(String etiquetaUrl) {
    //     this.etiquetaUrl = etiquetaUrl;
    // }

    public String getEtiquetaUrlPreta() {
        return etiquetaUrlPreta;
    }

    public void setEtiquetaUrlPreta(String etiquetaUrlPreta) {
        this.etiquetaUrlPreta = etiquetaUrlPreta;
    }

    public String getEtiquetaUrlBranca() {
        return etiquetaUrlBranca;
    }

    public void setEtiquetaUrlBranca(String etiquetaUrlBranca) {
        this.etiquetaUrlBranca = etiquetaUrlBranca;
    }

    public Localizacao getLocalizacao() {
        return localizacao;
    }

    public void setLocalizacao(Localizacao localizacao) {
        this.localizacao = localizacao;
    }

    public Comodato getComodato() {
        return comodato;
    }

    public void setComodato(Comodato comodato) {
        this.comodato = comodato;
    }

    public String getTermoUrl() {
        return termoUrl;
    }

    public void setTermoUrl(String termoUrl) {
        this.termoUrl = termoUrl;
    }

    public PatrimonioEspecifico() {
    }
}