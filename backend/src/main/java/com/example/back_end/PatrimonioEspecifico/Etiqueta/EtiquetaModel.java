package com.example.back_end.PatrimonioEspecifico.Etiqueta;

public class EtiquetaModel {

    private final String titulo;
    private final String convenio;
    private final String numPatrimonio;
    private final String qrUrl;

    public EtiquetaModel(String numPatrimonio, String qrUrl) {
        this.titulo = "PATRIMÔNIO";
        this.convenio = "CONVÊNIO WEBACADEMY";
        this.numPatrimonio = numPatrimonio;
        this.qrUrl = qrUrl;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getConvenio() {
        return convenio;
    }

    public String getNumPatrimonio() {
        return numPatrimonio;
    }

    public String getQrUrl() {
        return qrUrl;
    }
}
