package com.example.back_end.NotaFiscal.Services;

import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.BinaryBitmap;
import com.google.zxing.DecodeHintType;
import com.google.zxing.LuminanceSource;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.GlobalHistogramBinarizer;
import com.google.zxing.common.HybridBinarizer;

@Component
public class NotaFiscalKeyExtractor {

    private static final Logger log = LoggerFactory.getLogger(NotaFiscalKeyExtractor.class);

    public String extrairChaveDeXmlString(String xml) {
        Pattern pattern = Pattern.compile("<chNFe>(\\d{44})</chNFe>");
        Matcher matcher = pattern.matcher(xml);
        return matcher.find() ? matcher.group(1) : null;
    }

    public String extrairChaveHierarquicoLocal(byte[] pdfBytes) {
        String chave = extrairViaTexto(pdfBytes);
        if (validarChave(chave)) {
            return limparChave(chave);
        }

        chave = extrairViaCodigoBarras(pdfBytes);
        if (validarChave(chave)) {
            return limparChave(chave);
        }

        return null;
    }

    public boolean validarChave(String chave) {
        if (chave == null) {
            return false;
        }
        String limpa = limparChave(chave);
        return limpa.length() == 44 && validarCheckDigitNFe(limpa);
    }

    public String limparChave(String chave) {
        return chave == null ? "" : chave.replaceAll("\\D", "");
    }

    private String extrairViaCodigoBarras(byte[] bytes) {
        try (PDDocument doc = PDDocument.load(bytes)) {
            PDFRenderer pr = new PDFRenderer(doc);
            // Tenta renderizar em alta qualidade primeiro
            BufferedImage bi = pr.renderImageWithDPI(0, 500, ImageType.GRAY);
            String res = tentarDecodificar(bi);
            if (res != null) {
                return res;
            }

            int w = bi.getWidth();
            int h = bi.getHeight();
            // Tenta cortar a parte superior onde geralmente fica o código de barras
            BufferedImage crop = bi.getSubimage(w / 2, 0, w / 2, h / 3);
            res = tentarDecodificar(crop);
            if (res != null) {
                return res;
            }

            // Tenta rotacionar a imagem cortada
            BufferedImage rotated = rotateImage(crop, 90);
            res = tentarDecodificar(rotated);
            if (res != null) {
                return res;
            }

            return null;
        } catch (Exception e) {
            return null;
        }
    }

    private BufferedImage rotateImage(BufferedImage img, double ad) {
        double rads = Math.toRadians(ad);
        double sin = Math.abs(Math.sin(rads)), cos = Math.abs(Math.cos(rads));
        int w = img.getWidth(), h = img.getHeight();
        int newWidth = (int) Math.floor(w * cos + h * sin);
        int newHeight = (int) Math.floor(h * cos + w * sin);
        BufferedImage rotated = new BufferedImage(newWidth, newHeight, img.getType());
        java.awt.Graphics2D g2d = rotated.createGraphics();
        AffineTransform at = new AffineTransform();
        at.translate((newWidth - w) / 2.0, (newHeight - h) / 2.0);
        at.rotate(rads, w / 2.0, h / 2.0);
        g2d.setTransform(at);
        g2d.drawImage(img, 0, 0, null);
        g2d.dispose();
        return rotated;
    }

    private String tentarDecodificar(BufferedImage bi) {
        LuminanceSource source = new BufferedImageLuminanceSource(bi);
        try {
            BinaryBitmap bitmap = new BinaryBitmap(new GlobalHistogramBinarizer(source));
            return decodificarComHints(bitmap);
        } catch (Exception e) {
            try {
                BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));
                return decodificarComHints(bitmap);
            } catch (Exception e2) {
                return null;
            }
        }
    }

    private String extrairViaTexto(byte[] bytes) {
        try (PDDocument doc = PDDocument.load(bytes)) {
            String texto = new PDFTextStripper().getText(doc);
            Pattern pattern = Pattern.compile("\\b(\\d[\\s\\d]{42,60}\\d)\\b");
            Matcher matcher = pattern.matcher(texto);

            while (matcher.find()) {
                String potencialChave = matcher.group().replaceAll("\\s", "");
                if (potencialChave.length() == 44 && validarCheckDigitNFe(potencialChave)) {
                    return potencialChave;
                }
            }
        } catch (Exception e) {
            log.error("Erro na extração de texto: {}", e.getMessage());
        }
        return null;
    }

    private String decodificarComHints(BinaryBitmap bitmap) throws Exception {
        Map<DecodeHintType, Object> hints = new EnumMap<>(DecodeHintType.class);
        hints.put(DecodeHintType.TRY_HARDER, Boolean.TRUE);
        hints.put(DecodeHintType.ASSUME_GS1, Boolean.TRUE);
        hints.put(DecodeHintType.POSSIBLE_FORMATS, Arrays.asList(BarcodeFormat.CODE_128, BarcodeFormat.QR_CODE));
        return new MultiFormatReader().decode(bitmap, hints).getText();
    }

    private boolean validarCheckDigitNFe(String chave) {
        if (chave == null || chave.length() != 44) {
            return false;
        }
        int soma = 0, peso = 2;
        for (int i = 42; i >= 0; i--) {
            soma += Character.getNumericValue(chave.charAt(i)) * peso;
            peso = (peso == 9) ? 2 : peso + 1;
        }
        int resto = soma % 11;
        int dvEsperado = (resto == 0 || resto == 1) ? 0 : 11 - resto;
        return dvEsperado == Character.getNumericValue(chave.charAt(43));
    }

    public boolean isChaveRecenteParaSefaz(String chave) {
        if (chave == null || chave.length() != 44) {
            return false;
        }

        try {
            // Pega o YY (ex: 26) e o MM (ex: 02) da chave
            int ano = 2000 + Integer.parseInt(chave.substring(2, 4));
            int mes = Integer.parseInt(chave.substring(4, 6));

            YearMonth dataEmissao = YearMonth.of(ano, mes);
            YearMonth limite = YearMonth.now().minusMonths(6); // 6 meses de tolerância (~180 dias)

            // Retorna true se a data de emissão for IGUAL ou DEPOIS do limite
            return !dataEmissao.isBefore(limite);
        } catch (Exception e) {
            log.error("Erro ao ler data da chave: {}", e.getMessage());
            return false; // Na dúvida, manda pra API paga
        }
    }

}
