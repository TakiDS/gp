package com.example.back_end.Comodato;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;
import com.example.back_end.Titular.domain.Titular;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "comodato")
public class Comodato {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "uuid_comodato", updatable = false, nullable = false)
    private UUID uuid;

    @NotNull
    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim_esperado")
    private LocalDate dataFimEsperado;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    //termos ativos
    @Column(name = "validacaoTermo", updatable = true, nullable = false)
    private boolean validacaoTermo = false;

    @Column(name = "token_assinatura")
    private String tokenAssinatura;

    @Column(name = "data_expiracao_token")
    private LocalDateTime dataExpiracaoToken;

    @Column(name = "data_assinatura")
    private LocalDateTime dataAssinatura;

    @Column(name = "termo_url", nullable = true)
    private String termoUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_uso")
    private TipoUsoEnum tipoUso;

    @Enumerated((EnumType.STRING))
    @Column(name = "estado", nullable = false)
    private StatusEnum estado = StatusEnum.ASSINATURA;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToMany
    @JoinTable(
        name = "comodato_patrimonios", // Nome da nova tabela de histórico
        joinColumns = @JoinColumn(name = "comodato_uuid"),
        inverseJoinColumns = @JoinColumn(name = "patrimonio_uuid")
    )
    private List<PatrimonioEspecifico> patrimonios = new ArrayList<>();

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "titular_id", nullable = false)
    private Titular titular;

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataFimEsperado() {
        return dataFimEsperado;
    }

    public void setDataFimEsperado(LocalDate dataFimEsperado) {
        this.dataFimEsperado = dataFimEsperado;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }

    public boolean isValidacaoTermo() {
        return validacaoTermo;
    }

    public void setValidacaoTermo(boolean validacaoTermo) {
        this.validacaoTermo = validacaoTermo;
    }

    public String getTokenAssinatura() {
        return tokenAssinatura;
    }

    public void setTokenAssinatura(String tokenAssinatura) {
        this.tokenAssinatura = tokenAssinatura;
    }

    public LocalDateTime getDataExpiracaoToken() {
        return dataExpiracaoToken;
    }

    public void setDataExpiracaoToken(LocalDateTime dataExpiracaoToken) {
        this.dataExpiracaoToken = dataExpiracaoToken;
    }

    public LocalDateTime getDataAssinatura() {
        return dataAssinatura;
    }

    public void setDataAssinatura(LocalDateTime dataAssinatura) {
        this.dataAssinatura = dataAssinatura;
    }

    public String getTermoUrl() {
        return termoUrl;
    }

    public void setTermoUrl(String termoUrl) {
        this.termoUrl = termoUrl;
    }

    public TipoUsoEnum getTipoUso() {
        return tipoUso;
    }

    public void setTipoUso(TipoUsoEnum tipoUso) {
        this.tipoUso = tipoUso;
    }

    
    public StatusEnum getEstado() {
        return estado;
    }

    public void setEstado(StatusEnum estado) {
        this.estado = estado;
    }

    
    public List<PatrimonioEspecifico> getPatrimonios() {
        return patrimonios;
    }

    public void setPatrimonios(List<PatrimonioEspecifico> patrimonios) {
        this.patrimonios = patrimonios;
    }


    
    public Titular getTitular() {
        return titular;
    }

    public void setTitular(Titular titular) {
        this.titular = titular;
    }


    public Comodato() {

    }
    
}

//pensar em renovação de contratos pro fututro, isso necessitaria um historico de comodatos referentes a um equipamento
