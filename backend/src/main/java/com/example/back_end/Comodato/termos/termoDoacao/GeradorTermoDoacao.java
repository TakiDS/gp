package com.example.back_end.Comodato.termos.termoDoacao;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
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
public class GeradorTermoDoacao implements GeradorTermo{
    
    private final PatrimonioEspecificoRepository patrepository;
    private final TemplateEngine templateEngine;

    public GeradorTermoDoacao(PatrimonioEspecificoRepository patrepository, TemplateEngine templateEngine) {
        this.patrepository = patrepository;
        this.templateEngine = templateEngine;
    }

    private final DateTimeFormatter formatter =
        DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy", new Locale("pt", "BR"));


    @Override
    public byte[] gerarPdf(List<UUID> idsPatrimonio, ContextoTermo contexto) {
        // Na Baixa, a referência costuma ser o próprio Patrimônio

        if (contexto == null) {
            throw new IllegalArgumentException("O contexto do termo de doação não pode ser nulo.");
        }

        if (contexto.nomeDoado() == null || contexto.nomeDoado().isBlank() ||
            contexto.cpfDoado() == null || contexto.cpfDoado().isBlank()) {
            throw new IllegalArgumentException("Nome e CPF do doador são obrigatórios para gerar o Termo de Doação.");
        }

        List<PatrimonioEspecifico> listaParaBaixa = patrepository.findAllById(idsPatrimonio);
        
        if(listaParaBaixa.isEmpty()) {
            throw new EntityNotFoundException("Patrimonio(s) não encontrados.");
        }

        BigDecimal total = listaParaBaixa.stream().map(p -> p.getPatrimonioGeral() != null ? 
        p.getPatrimonioGeral().getValorAquisicao() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);
        
        ZoneId fusoAcre = ZoneId.of("America/Rio_Branco");
        String dataHojeFormatada = LocalDate.now(fusoAcre).format(formatter);

        Termo termo = new Termo();
        termo.setTipoTermo(TipoTermoEnum.BAIXA);

        Context context = new Context();
        context.setVariable("patrimonios", listaParaBaixa);
        context.setVariable("dataFormatada", dataHojeFormatada);
        context.setVariable("valorTotal", total);
        context.setVariable("nome", contexto.nomeDoado());
        context.setVariable("cpf", contexto.cpfDoado());
        context.setVariable("observacao", contexto.observacao());

        

        // A MÁGICA: Chamamos o HTML específico da DOACAO
        String html = templateEngine.process("termo_doacao", context);
        return converterParaPdf(html);
    }

    @Override
    public TipoTermoEnum getTipoTermo() {
        return TipoTermoEnum.DOACAO;
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
