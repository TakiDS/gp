package com.example.back_end.Titular.domain;

public enum StatusPerfil {
    ATIVO(true),
    INATIVO(false);

    private final boolean permiteComodato;

    StatusPerfil(boolean permiteComodato) {
        this.permiteComodato = permiteComodato;
    }

    public boolean permiteComodato() {
        return permiteComodato;
    }
}
