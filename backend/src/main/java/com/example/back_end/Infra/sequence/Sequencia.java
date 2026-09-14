package com.example.back_end.Infra.sequence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "codigo-etiqueta")
public class Sequencia {
    
    @Id
    private String chave;

    @Column
    private Integer ultimoValor;

    public String getChave() {
        return chave;
    }

    public void setChave(String chave) {
        this.chave = chave;
    }

    public Integer getUltimoValor() {
        return ultimoValor;
    }

    public void setUltimoValor(Integer ultimoValor) {
        this.ultimoValor = ultimoValor;
    }
}
