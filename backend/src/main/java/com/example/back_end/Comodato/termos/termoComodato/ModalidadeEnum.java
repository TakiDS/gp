package com.example.back_end.Comodato.termos.termoComodato;

public enum ModalidadeEnum {
    INICIACAO("aprovado como bolsista na metodologia INICIAÇÃO CIENTÍFICA,"),
    MESTRANDO("aprovado como bolsista na metodologia MESTRADO,"),
    COMUM("");

    private String descricao;

    ModalidadeEnum(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
