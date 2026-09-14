package com.example.back_end.Localizacao.auditoria;

import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

@Service
public class PdfService {
    
    private final TemplateEngine templateEngine;

    public PdfService(TemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    public String gerarPdf(DadosImpressaoAuditoria dados) {
        // 1. Processa o HTML com Thymeleaf
        Context context = new Context();
        context.setVariable("dados", dados);
        String htmlProcessado = templateEngine.process("documento_auditoria", context);

        // 2. Caminho do arquivo
        String nomeArquivo = "auditoria_" + UUID.randomUUID() + ".pdf";
        String caminhoArquivo = System.getProperty("java.io.tmpdir") + "/" + nomeArquivo;

        // 3. Renderiza o PDF com Flying Saucer
        try (OutputStream os = new FileOutputStream(caminhoArquivo)) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(htmlProcessado);
            renderer.layout();
            renderer.createPDF(os);
            return caminhoArquivo;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF", e);
        }
    }
}
