package com.example.back_end.Comodato;

public enum StatusEnum {
    ASSINATURA, //assinatura pendente
    PENDENTE,
    ATRASADO,
    DEVOLVIDO,
    CANCELADO,
    EXTRAVIADO;

    public boolean isAtivo() {
        return this == PENDENTE || this == ATRASADO;
    }

    public boolean isFinalizado() {
        return this == DEVOLVIDO;
    }

    public boolean aguardandoAssinatura() {
        return this == ASSINATURA;
    }

    public boolean isCancelado() {
        return this == CANCELADO;
    }

    public boolean isExtraviado() {
        return this == EXTRAVIADO;
    }

    public boolean podeEditar() {
        return this == ASSINATURA || this == PENDENTE || this == ATRASADO;
    }

    public boolean podeTransicionarPara(StatusEnum novoEstado) {

        // Regra: Qualquer estado "em aberto" pode ir para EXTRAVIADO se o item sumir
    if (novoEstado == EXTRAVIADO) {
        return this == ASSINATURA || this == PENDENTE || this == ATRASADO;
    }

        if (this == DEVOLVIDO || this == CANCELADO || this == EXTRAVIADO) {
            return false;
        }

        if (this == ASSINATURA && (novoEstado == PENDENTE || novoEstado == CANCELADO)) {
            return true;
        }

        if (this == PENDENTE && (novoEstado == ATRASADO || novoEstado == DEVOLVIDO)) {
            return true;
        }

        if (this == ATRASADO && novoEstado == DEVOLVIDO) {
            return true;
        }

        return false;
    }
}
