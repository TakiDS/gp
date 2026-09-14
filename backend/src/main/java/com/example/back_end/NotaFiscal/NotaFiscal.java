package com.example.back_end.NotaFiscal;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.example.back_end.PatrimonioGeral.PatrimonioGeral;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name="notaFiscal")
public class NotaFiscal {
    //Id da tabela notaFiscal usando o UUID gerado pelo java
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "uuid_notaFiscal", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID uuid;

    @Column(name="codigoNota", updatable=true, nullable=false, unique=true)
    private String codigoNota;

    @Column(name="fornecedor", updatable=true, nullable=true)
    private String fornecedor;

    @Column(name="cnpj", updatable=true, nullable=true)
    private String cnpj;

    @Column(name="valorTotalNota", updatable=true, nullable=true)
    private BigDecimal valorTotalNota;

    //data da emissao da nota
    @Column(name="dataEmissao", updatable=true, nullable=false)
    private LocalDate dataEmissao;

    //url da nota fiscal armazenada em algum drive ai
    @Column(name="notaFiscalUrl", updatable=true, nullable=false)
    private String notaFiscalUrl;

    //Adicionando a chave da NF-e no banco para evitar cadastro da mesma nota fiscal
    @Column(name="chaveAcesso", unique=true)
    private String chaveAcesso;

    //data da criação da nota
    @Column(name="dataCriacao", updatable=true, nullable=false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private StatusNota status = StatusNota.SEM_PATRIMONIOS;

    @Column(name="quantidade_itens_nota", updatable=true, nullable=true)
    private Integer quantidadeItensNota;

    //Relacionamento para poder conseguir contar os itens vinculados
    @OneToMany(mappedBy="notaFiscal")
    @JsonIgnore
    private List<PatrimonioGeral> patrimoniosGerais;

    @Column(name="criadoAutomatico", updatable = true)
    private boolean criadoAutomatico = false;


    public boolean isCriadoAutomatico() {
        return criadoAutomatico;
    }

    public void setCriadoAutomatico(boolean criadoAutomatico) {
        this.criadoAutomatico = criadoAutomatico;
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public LocalDate getDataEmissao() {
        return dataEmissao;
    }

    public void setDataEmissao(LocalDate dataEmissao) {
        this.dataEmissao = dataEmissao;
    }

    public String getNotaFiscalUrl() {
        return notaFiscalUrl;
    }

    public void setNotaFiscalUrl(String notaFiscalUrl) {
        this.notaFiscalUrl = notaFiscalUrl;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public String getCodigoNota() {
        return codigoNota;
    }

    public void setCodigoNota(String codigoNota) {
        this.codigoNota = codigoNota;
    }

    public String getFornecedor() {
        return fornecedor;
    }

    public void setFornecedor(String fornecedor) {
        this.fornecedor = fornecedor;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public BigDecimal getValorTotalNota() {
        return valorTotalNota;
    }

    public void setValorTotalNota(BigDecimal valorTotalNota) {
        this.valorTotalNota = valorTotalNota;
    }

    public StatusNota getStatus() {
        return status;
    }

    public void setStatus(StatusNota status) {
        this.status = status;
    }

   
    public Integer getQuantidadeItensNota() {
        return quantidadeItensNota;
    }

    public void setQuantidadeItensNota(Integer quantidadeItensNota) {
        this.quantidadeItensNota = quantidadeItensNota;
    }

    public List<PatrimonioGeral> getPatrimoniosGerais() {
        return patrimoniosGerais;
    }

    public void setPatrimoniosGerais(List<PatrimonioGeral> patrimoniosGerais) {
        this.patrimoniosGerais = patrimoniosGerais;
    }

    public String getChaveAcesso() {
        return chaveAcesso;
    }

    public void setChaveAcesso(String chaveAcesso) {
        this.chaveAcesso = chaveAcesso;
    }

    
}