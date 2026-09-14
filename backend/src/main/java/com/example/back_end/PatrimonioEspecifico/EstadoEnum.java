package com.example.back_end.PatrimonioEspecifico;

public enum EstadoEnum {
    GUARDADO(true, true, true, false), //tao em armario ou acabaram de ser adicionados no sistema
    EMPRESTIMO(false, false, true, true),
    USO(true, false, true, false), //esses tao em lab
    BAIXA(false, false, true, false),
    MANUTENCAO(true, false, true, false),
    DOACAO(false, false, true, false),
    DEFEITO(true, false, true, false),
    EXTRAVIADO(false, false, true, true);

    private final boolean permiteLocal;
    private final boolean permiteComodato;
    private final boolean permiteEdicao;
    private final boolean permiteRetornarDadoComodato;

    EstadoEnum(boolean permiteLocal, boolean permiteComodato, boolean permiteEdicao, boolean permiteRetornarDadoComodato) {
        this.permiteLocal = permiteLocal;
        this.permiteComodato = permiteComodato;
        this.permiteEdicao = permiteEdicao;
        this.permiteRetornarDadoComodato = permiteRetornarDadoComodato;
    }

    public boolean permiteLocal() {
        return permiteLocal;
    }

    public boolean permiteComodato() {
        return permiteComodato;
    }

    public boolean permiteEdicao() {
        return permiteEdicao;
    }

    public boolean permiteRetornarDadoComodato() {
        return permiteRetornarDadoComodato;
    }
}

// mano

//usar tipo booleano no enum pra "ensiná-lo" a saber se deve aceitar um local ou não