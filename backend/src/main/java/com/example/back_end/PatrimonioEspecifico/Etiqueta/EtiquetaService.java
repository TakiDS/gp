package com.example.back_end.PatrimonioEspecifico.Etiqueta;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.back_end.Infra.cloudinary.CloudinaryService;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecificoRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageConfig;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import jakarta.persistence.EntityNotFoundException;

@Service
public class EtiquetaService {

    @Value("${app.base-url}") 
    private String baseUrl;

    private final CloudinaryService cloudinaryService;
    private final RestTemplate restTemplate;
    private final PatrimonioEspecificoRepository patrepo;

    public EtiquetaService(CloudinaryService cloudinaryService, RestTemplate restTemplate, PatrimonioEspecificoRepository patrepo) {
        this.cloudinaryService = cloudinaryService;
        this.restTemplate = restTemplate;
        this.patrepo = patrepo;
    }

    public Map<String, String> gerarEtiqueta(String numPatrimonio, UUID uuid) {

        String qrUrl = baseUrl + "/public/patrimonio/" + uuid;
        EtiquetaModel model = new EtiquetaModel(numPatrimonio, qrUrl);

        byte[] pdfPreto = gerarPdf(model, false);
        byte[] pdfBranco = gerarPdf(model, true);

        Map<String, String> urls = new HashMap<>();

        try {
           // 1. Dispara os DOIS uploads em Threads separadas (ao mesmo tempo)
            CompletableFuture<Map<String, Object>> uploadPreto = CompletableFuture.supplyAsync(() -> {
                try {
                    return cloudinaryService.uploadEtiqueta(pdfPreto, uuid.toString() + "-preto");
                } catch (IOException e) {
                    throw new RuntimeException("Erro no upload da etiqueta preta no Cloudinary", e);
                }
            });

            CompletableFuture<Map<String, Object>> uploadBranco = CompletableFuture.supplyAsync(() -> {
                try {
                    return cloudinaryService.uploadEtiqueta(pdfBranco, uuid.toString() + "-branco");
                } catch (IOException e) {
                    throw new RuntimeException("Erro no upload da etiqueta branca no Cloudinary", e);
                }
            });

            // 2. Trava a execução apenas aqui, aguardando AMBOS terminarem
            CompletableFuture.allOf(uploadPreto, uploadBranco).join();

            // 3. Extrai os resultados (que já estão prontos)
            urls.put("urlPreta", uploadPreto.get().get("secure_url").toString());
            urls.put("urlBranca", uploadBranco.get().get("secure_url").toString());

            return urls;

        } catch (Exception e) {
            throw new RuntimeException("Erro ao subir etiqueta", e);
        }
    }

    public byte[] retornoEtiqueta(UUID uuid, boolean isBranco) throws IOException {

        PatrimonioEspecifico pat = patrepo.findById(uuid)
            .orElseThrow(() -> new EntityNotFoundException("Patrimônio não encontrado"));

        if (pat.getEtiquetaUrlPreta() == null && pat.getEtiquetaUrlBranca() == null) {
            throw new IllegalStateException("Etiqueta ainda não foi gerada.");
        }

        String sufixo = isBranco ? "-branco" : "-preto";
        return cloudinaryService.downloadEtiqueta(uuid.toString() + sufixo);
    }

    public byte[] gerarPdf(EtiquetaModel model, boolean isBranco) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();

            // 6.5cm x 3cm
            Rectangle tam = new Rectangle(184, 85); 
            float mmToPt = 2.83465f;
            float margemInterna = 2f * mmToPt; // 2mm reais

            Document document = new Document(
                    tam,
                    margemInterna,
                    margemInterna,
                    margemInterna,
                    margemInterna
            );

            
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            // ================= DEFINE A COR PRINCIPAL =================
            Color corFundo = isBranco ? Color.BLACK : Color.WHITE;
            Color corElemento = isBranco ? Color.WHITE : Color.BLACK;

            tam.setBackgroundColor(corFundo);

            // ================= BORDA INTERNA =================
            PdfContentByte canvas = writer.getDirectContent();

            canvas.setColorStroke(corElemento);
            canvas.setLineWidth(1.2f);
            canvas.setColorFill(corFundo);
            canvas.rectangle(0, 0, tam.getWidth(), tam.getHeight());
            canvas.fill();

            float radius = 4f;
            canvas.roundRectangle(
                    margemInterna,
                    margemInterna,
                    tam.getWidth() - (margemInterna * 2),
                    tam.getHeight() - (margemInterna * 2),
                    radius
            );

            canvas.stroke();

            // ================= FONTES DINÂMICAS =================
            Font fonteTitulo = new Font(Font.HELVETICA, 5, Font.BOLD, corElemento);
            Font fonteNumero = new Font(Font.HELVETICA, 9, Font.BOLD, corElemento);
            Font fonteNormal = new Font(Font.HELVETICA, 5, Font.BOLD, corElemento);

            // ================= TABELA PRINCIPAL =================
            PdfPTable table = new PdfPTable(2);
            table.setTotalWidth(tam.getWidth() - (margemInterna * 2));
            table.setLockedWidth(true);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{4f, 6f});
            table.setSplitLate(false);
            table.setKeepTogether(true);
            table.setSpacingBefore(5f);

            // ==================================================
            // 🔲 DIV 1 — QR CODE + TEXTO
            // ==================================================
            PdfPTable qrContainer = new PdfPTable(1);
            qrContainer.setWidthPercentage(100);
            qrContainer.getDefaultCell().setPadding(0);

            com.lowagie.text.Image qr = gerarQrCode(model.getQrUrl(), isBranco, corFundo);
            if (qr != null) {
                qr.scaleToFit(60, 60);
            }

            PdfPCell qrImageCell = new PdfPCell(qr);
            qrImageCell.setBorder(PdfPCell.NO_BORDER);
            qrImageCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            qrImageCell.setPadding(1f);

            Paragraph qrTexto = new Paragraph("LEIA O QRCODE ACIMA", fonteNormal);
            qrTexto.setAlignment(Element.ALIGN_CENTER);
            

            PdfPCell qrTextCell = new PdfPCell(qrTexto);
            qrTextCell.setBorder(PdfPCell.NO_BORDER);
            qrTextCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            qrTextCell.setPaddingTop(0.5f);

            qrContainer.addCell(qrImageCell);
            qrContainer.addCell(qrTextCell);

            PdfPCell div1 = new PdfPCell(qrContainer);
            div1.setBorder(PdfPCell.NO_BORDER);
            div1.setVerticalAlignment(Element.ALIGN_MIDDLE);
            div1.setPadding(0);

            // ==================================================
            // 🔲 DIV 2 — TEXTOS DO PATRIMÔNIO
            // ==================================================
            PdfPTable textoContainer = new PdfPTable(1);
            textoContainer.setWidthPercentage(100);

            Paragraph tituloP = new Paragraph(model.getTitulo(), fonteTitulo);
            tituloP.setAlignment(Element.ALIGN_CENTER);

            Paragraph numeroP = new Paragraph(model.getNumPatrimonio(), fonteNumero);
            numeroP.setAlignment(Element.ALIGN_CENTER);

            Paragraph convenioP = new Paragraph(model.getConvenio(), fonteNormal);
            convenioP.setAlignment(Element.ALIGN_CENTER);

            PdfPCell tituloCell = new PdfPCell(tituloP);
            tituloCell.setBorder(PdfPCell.NO_BORDER);
            tituloCell.setPaddingBottom(1f);
            tituloCell.setHorizontalAlignment(Element.ALIGN_CENTER);

            PdfPCell numeroCell = new PdfPCell(numeroP);
            numeroCell.setBorder(PdfPCell.NO_BORDER);
            numeroCell.setPaddingBottom(1f);
            numeroCell.setHorizontalAlignment(Element.ALIGN_CENTER);

            PdfPCell convenioCell = new PdfPCell(convenioP);
            convenioCell.setBorder(PdfPCell.NO_BORDER);
            convenioCell.setHorizontalAlignment(Element.ALIGN_CENTER);

            textoContainer.addCell(tituloCell);
            textoContainer.addCell(numeroCell);
            textoContainer.addCell(convenioCell);

            PdfPCell div2 = new PdfPCell(textoContainer);
            div2.setVerticalAlignment(Element.ALIGN_MIDDLE);
            div2.setBorder(PdfPCell.NO_BORDER);

            // ================= ADICIONA NA TABELA =================
            table.addCell(div1);
            table.addCell(div2);

            document.add(table);
            document.close();

            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF da etiqueta", e);
        }
    }

    private com.lowagie.text.Image gerarQrCode(String texto, boolean isBranco, Color corFundo) throws Exception {

        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.MARGIN, 0); // remove margem branca
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

        BitMatrix matrix = new MultiFormatWriter()
        .encode(texto, BarcodeFormat.QR_CODE, 300, 300);

        // Fundo SEMPRE transparente
        int corForeground = isBranco ? 0xFFFFFFFF : 0xFF000000;
        int corBackground = corFundo.getRGB();

        MatrixToImageConfig config = new MatrixToImageConfig(corForeground, corBackground);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "png", baos, config);
        
        return com.lowagie.text.Image.getInstance(baos.toByteArray());
    }

}