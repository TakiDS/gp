package com.example.back_end.PatrimonioGeral;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.example.back_end.Categoria.Categoria;
import com.example.back_end.NotaFiscal.NotaFiscal;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "patrimonioGeral")
public class PatrimonioGeral {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "uuid_patrimonioGeral", updatable = false, nullable = false)
    private UUID uuid;

    @Column(name = "descricao", updatable = true, nullable = false)
    private String descricao;

    @Column(name = "dataAquisicao", updatable = true, nullable = false)
    private LocalDate dataAquisicao;

    @Column(name = "valorAquisicao", updatable = true, nullable = false)
    private BigDecimal valorAquisicao;

    @Column(name = "dataCriacao", updatable = false, nullable = false)
    private LocalDateTime dataCriacao;
    @PrePersist
    public void prePersist() {
        if (dataCriacao == null) {
            dataCriacao = LocalDateTime.now();
        }
    }
    //Teste mais uma vez, testando mais uma vez, vamos amigo, qual foi github vai fazer o container da minha aplicação não oh vacilão

    @ManyToOne
    @JoinColumn(name = "notaFiscal_uuid_notaFiscal", nullable = true)
    private NotaFiscal notaFiscal;

    @ManyToOne
    @JoinColumn(name = "uuid_categoria", nullable = false)
    private Categoria categoria;
    
    
    @OneToMany(mappedBy = "patrimonioGeral", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<PatrimonioEspecifico> patrimoniosEspecificos = new ArrayList<>();

    //Campo no banco para diferenciar patrimonios criados automaticamente apartir de notas ficais
    @Column(name="patrimonioAutomatico")
    private boolean patrimonioAutomatico;

    // Getters e Setters ...
    public UUID getUuid() {
        return uuid;
    }

    public boolean isPatrimonioAutomatico() {
        return patrimonioAutomatico;
    }

    public void setPatrimonioAutomatico(boolean patrimonioAutomatico) {
        this.patrimonioAutomatico = patrimonioAutomatico;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LocalDate getDataAquisicao() {
        return dataAquisicao;
    }

    public void setDataAquisicao(LocalDate dataAquisicao) {
        this.dataAquisicao = dataAquisicao;
    }

    public BigDecimal getValorAquisicao() {
        return valorAquisicao;
    }

    public void setValorAquisicao(BigDecimal valorAquisicao) {
        this.valorAquisicao = valorAquisicao;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public NotaFiscal getNotaFiscal() {
        return notaFiscal;
    }

    public void setNotaFiscal(NotaFiscal notaFiscal) {
        this.notaFiscal = notaFiscal;
    }

    public List<PatrimonioEspecifico> getPatrimonio() {
        return patrimoniosEspecificos;
    }

    public void setPatrimonio(List<PatrimonioEspecifico> patrimoniosEspecificos) {
        this.patrimoniosEspecificos = patrimoniosEspecificos;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }
}