package com.example.back_end.Comodato.termos.termoBaixa;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import com.example.back_end.Comodato.termos.ContextoTermo;
import com.example.back_end.Comodato.termos.GeradorTermo;
import com.example.back_end.Comodato.termos.Termo;
import com.example.back_end.Comodato.termos.TipoTermoEnum;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecificoRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class GeradorTermoBaixa implements GeradorTermo{
    
    private final PatrimonioEspecificoRepository patrepository;
    private final TemplateEngine templateEngine;

    public GeradorTermoBaixa(PatrimonioEspecificoRepository patrepository, TemplateEngine templateEngine) {
        this.patrepository = patrepository;
        this.templateEngine = templateEngine;
    }

    private final DateTimeFormatter formatter =
        DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy", new Locale("pt", "BR"));

    @Override
    public byte[] gerarPdf(List<UUID> idsPatrimonio, ContextoTermo contexto) {
        List<PatrimonioEspecifico> listaParaBaixa = patrepository.findAllById(idsPatrimonio);
        // Na Baixa, a referência costuma ser o próprio Patrimônio
        if(listaParaBaixa.isEmpty()) {
            throw new EntityNotFoundException("Patrimonio(s) não encontrados.");
        }

        ContextoTermo contextoSeguro = (contexto != null) ? contexto : new ContextoTermo(null, null, "");

        //CORREÇÃO NO FUSO
        ZoneId fusoAcre = ZoneId.of("America/Rio_Branco");
        String dataHojeFormatada = LocalDate.now(fusoAcre).format(formatter);

        Termo termo = new Termo();
        termo.setTipoTermo(TipoTermoEnum.BAIXA);

        Context context = new Context();
        context.setVariable("patrimonios", listaParaBaixa);
        context.setVariable("dataFormatada", dataHojeFormatada);
        context.setVariable("observacao", contextoSeguro.observacao());

        // A MÁGICA: Chamamos o HTML específico da BAIXA
        String html = templateEngine.process("termo_baixa", context);
        return converterParaPdf(html);
    }

    @Override
    public TipoTermoEnum getTipoTermo() {
        return TipoTermoEnum.BAIXA;
    }

    private byte[] converterParaPdf(String html) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao renderizar PDF de Baixa", e);
        }
    }
}
