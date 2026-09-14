package com.example.back_end.Localizacao;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.Formula;

import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "localizacao")
public class Localizacao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "uuid_localizacao", updatable = false, nullable = false)
    private UUID uuid;

    @NotBlank
    @Column(name = "local", updatable = true)
    private String local;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "localizacao")
    private List<PatrimonioEspecifico> patrimonio;

    // Vou esperimentar um negocio
    @Formula("(SELECT count(*) FROM patrimonio_especificado p WHERE p.uuid_localizacao = uuid_localizacao)")
    private int totalPatrimonio;

    @Column(name = "termo_auditoria_url")
    private String termoAuditoriaUrl;

    public String getTermoAuditoriaUrl() {
        return termoAuditoriaUrl;
    }

    public void setTermoAuditoriaUrl(String termoAuditoriaUrl) {
        this.termoAuditoriaUrl = termoAuditoriaUrl;
    }

    public int getTotalPatrimonio() {
        return totalPatrimonio;
    }

    public UUID getUuid() {
        return uuid;
    }

    public String getLocal() {
        return local;
    }

    public void setLocal(String local) {
        this.local = local;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }
    
    public List<PatrimonioEspecifico> getPatrimonio() {
        return patrimonio;
    }

    public void setPatrimonio(List<PatrimonioEspecifico> patrimonio) {
        this.patrimonio = patrimonio;
    }

    public Localizacao() {

    }
}
