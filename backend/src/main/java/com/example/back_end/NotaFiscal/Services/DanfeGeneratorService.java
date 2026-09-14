package com.example.back_end.NotaFiscal.Services;

import java.nio.charset.StandardCharsets;

import org.springframework.stereotype.Service;

import br.com.swconsultoria.impressao.model.Impressao;
import br.com.swconsultoria.impressao.service.ImpressaoService;
import br.com.swconsultoria.impressao.util.ImpressaoUtil;
import net.sf.jasperreports.engine.DefaultJasperReportsContext;
import net.sf.jasperreports.engine.JRPropertiesUtil;

@Service
public class DanfeGeneratorService {

    public byte[] gerarPdfDoXml(byte[] xmlBytes) {
        try {
            // FORÇA a ignorar fontes ausentes e usar SansSerif via código!
            JRPropertiesUtil.getInstance(DefaultJasperReportsContext.getInstance())
                    .setProperty("net.sf.jasperreports.awt.ignore.missing.font", "true");
            JRPropertiesUtil.getInstance(DefaultJasperReportsContext.getInstance())
                    .setProperty("net.sf.jasperreports.default.font.name", "SansSerif");

            String xmlString = new String(xmlBytes, StandardCharsets.UTF_8);
            Impressao impressao = ImpressaoUtil.impressaoPadraoNFe(xmlString);
            
            return ImpressaoService.impressaoPdfByte(impressao);

        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar o PDF do DANFE: " + e.getMessage(), e);
        }
    }
}
