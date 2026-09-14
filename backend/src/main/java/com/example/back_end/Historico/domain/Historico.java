package com.example.back_end.Historico.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.example.back_end.UsuarioSistema.domain.UsuarioSistema;

@Entity
@Table(name = "historico")
public class Historico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoAcaoEnum tipoAcao;

    @Column(columnDefinition = "TEXT")
    private String detalhesJson;

    @Column(name = "id_entidade_afetada")
    private String idEntidadeAfetada;

    private LocalDateTime dataHora = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "usuario_responsavel_id")
    private UsuarioSistema usuarioResponsavel;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TipoAcaoEnum getTipoAcao() {
        return tipoAcao;
    }

    public void setTipoAcao(TipoAcaoEnum tipoAcao) {
        this.tipoAcao = tipoAcao;
    }

    public String getDetalhesJson() {
        return detalhesJson;
    }

    public void setDetalhesJson(String detalhesJson) {
        this.detalhesJson = detalhesJson;
    }

    public String getIdEntidadeAfetada() {
        return idEntidadeAfetada;
    }

    public void setIdEntidadeAfetada(String idEntidadeAfetada) {
        this.idEntidadeAfetada = idEntidadeAfetada;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public UsuarioSistema getUsuarioResponsavel() {
        return usuarioResponsavel;
    }

    public void setUsuarioResponsavel(UsuarioSistema usuarioResponsavel) {
        this.usuarioResponsavel = usuarioResponsavel;
    }

}