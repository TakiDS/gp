package com.example.back_end.Titular.domain;

import com.example.back_end.Comodato.TipoUsoEnum;
import com.example.back_end.Comodato.termos.termoComodato.ModalidadeEnum;

public enum PerfilEnum { //adicionar o mestrando
    MONITOR(TipoUsoEnum.EXTERNO, ModalidadeEnum.INICIACAO, true),
    MESTRANDO(TipoUsoEnum.EXTERNO, ModalidadeEnum.MESTRANDO, true),
    SERVIDORINTERNO(TipoUsoEnum.EXTERNO, ModalidadeEnum.COMUM , true),
    SERVIDOREXTERNO(TipoUsoEnum.EXTERNO, ModalidadeEnum.COMUM, true);

    private final TipoUsoEnum tipoUsoPadrao;
    private final ModalidadeEnum modalidadeEnum;
    private final boolean permiteComodato;

    PerfilEnum(TipoUsoEnum tipoUsoPadrao, ModalidadeEnum modalidadeEnum, boolean permiteComodato) {
        this.tipoUsoPadrao = tipoUsoPadrao;
        this.modalidadeEnum = modalidadeEnum;
        this.permiteComodato = permiteComodato;
    }

    public TipoUsoEnum tipoUsoPadrao() {
        return tipoUsoPadrao;
    }

    public ModalidadeEnum ModalidadeEnum() {
        return modalidadeEnum;
    }

    public boolean permiteComodato() {
        return permiteComodato;
    }
}
