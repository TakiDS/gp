package com.example.back_end.Comodato.termos.termoExtravio;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import com.example.back_end.Comodato.Comodato;
import com.example.back_end.Comodato.termos.ContextoTermo;
import com.example.back_end.Comodato.termos.GeradorTermo;
import com.example.back_end.Comodato.termos.TipoTermoEnum;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecificoRepository;

@Service
public class GeradorTermoExtravio implements GeradorTermo {
    
    private final PatrimonioEspecificoRepository patrepository;
    private final TemplateEngine templateEngine;

    public GeradorTermoExtravio(PatrimonioEspecificoRepository patrepository, TemplateEngine templateEngine) {
        this.patrepository = patrepository;
        this.templateEngine = templateEngine;
    }

    private final DateTimeFormatter formatter =
        DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy", new Locale("pt", "BR"));

    @Override
    public byte[] gerarPdf(List<UUID> referenciasIds, ContextoTermo contexto) {
        // Busca os patrimônios
        List<PatrimonioEspecifico> patrimonios = patrepository.findAllById(referenciasIds);

        if (patrimonios.isEmpty()) {
            throw new RuntimeException("Nenhum patrimônio encontrado para extravio.");
        }

        ZoneId fusoAcre = ZoneId.of("America/Rio_Branco");
        String dataHojeFormatada = LocalDate.now(fusoAcre).format(formatter);

        // Tenta encontrar o último detentor antes de gerar o termo
        Comodato ultimoComodato = patrimonios.stream()
        .map(PatrimonioEspecifico::getComodato)
        .filter(Objects::nonNull)
        // Filtro de segurança: Só aceita se o comodato NÃO estiver finalizado/devolvido
        .filter(c -> !c.getEstado().isFinalizado()) 
        .findFirst()
        .orElse(null);

        Context context = new Context();
        context.setVariable("patrimonios", patrimonios); 
        context.setVariable("comodato", ultimoComodato);
        context.setVariable("observacao", contexto.observacao()); 
        context.setVariable("dataFormatada", dataHojeFormatada);

        String cpf = (ultimoComodato != null && ultimoComodato.getTitular() != null) 
            ? ultimoComodato.getTitular().getCpf() : "N/A";
        
        context.setVariable("cpfTitular", cpf);

        String html = templateEngine.process("termo_extravio", context);
        return converterParaPdf(html);
    }

    @Override
    public TipoTermoEnum getTipoTermo() {
        return TipoTermoEnum.EXTRAVIO;
    }

    private byte[] converterParaPdf(String html) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            e.printStackTrace(); 
            throw new RuntimeException("Erro ao renderizar PDF de Extravio: " + e.getMessage(), e);
        }
    }
}
