package com.example.back_end.Comodato.termos;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.UUID;

import org.xhtmlrenderer.pdf.ITextRenderer;

public interface GeradorTermo {

    byte[] gerarPdf(List<UUID> referenciaisId, ContextoTermo contexto);
    TipoTermoEnum getTipoTermo();

    // Método default para evitar repetição em todas as classes
    default byte[] converterHtmlParaPdf(String html) {
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(os);
            return os.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao converter PDF", e);
        }
    }
}
