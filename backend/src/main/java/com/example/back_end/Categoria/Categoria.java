package com.example.back_end.Categoria;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.example.back_end.PatrimonioGeral.PatrimonioGeral;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name="categoria")
public class Categoria {
    //Id da tabela categoria usando o UUID gerado pelo java
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "uuid_categoria", updatable = false, nullable = false)
    private UUID uuid;

    //Nome da categoria
    @NotBlank
    @Column(name="nome", updatable= true, nullable=false)
    private String nome;
    
    //Campo de descricao da categoria
    @Column(name="descricao", updatable= true, nullable=false)
    private String descricao;

    //Data de Criação para ordenamento
    @Column(name="data_criacao")
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "categoria", fetch = FetchType.LAZY)
    private List<PatrimonioGeral> patrimonioGeral;
    
    private int totalPatrimonio;

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

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public List<PatrimonioGeral> getPatrimonioGeral() {
        return patrimonioGeral;
    }

    public void setPatrimonioGeral(List<PatrimonioGeral> patrimonioGeral) {
        this.patrimonioGeral = patrimonioGeral;
    }

    public int getTotalPatrimonio() {
        return totalPatrimonio;
    }

    public void setTotalPatrimonio(int totalPatrimonio) {
        this.totalPatrimonio = totalPatrimonio;
    }


    public Categoria() {

    }

}
