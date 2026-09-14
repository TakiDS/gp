package com.example.back_end.Comodato.termos.termoComodato;

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

import com.example.back_end.Comodato.Comodato;
import com.example.back_end.Comodato.ComodatoRepository;
import com.example.back_end.Comodato.termos.ContextoTermo;
import com.example.back_end.Comodato.termos.GeradorTermo;
import com.example.back_end.Comodato.termos.Termo;
import com.example.back_end.Comodato.termos.TipoTermoEnum;

import jakarta.persistence.EntityNotFoundException;

@Service
public class GeradorTermoComodato implements GeradorTermo {

    private final ComodatoRepository repository;
    private final TemplateEngine templateEngine;

    public GeradorTermoComodato(ComodatoRepository repository, TemplateEngine templateEngine) {
        this.repository = repository;
        this.templateEngine = templateEngine;
    }

    private final DateTimeFormatter formatter =
        DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy", new Locale("pt", "BR"));

    private final DateTimeFormatter formatterSimples = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    public byte[] gerarPdf(List<UUID> referenciasIds, ContextoTermo contexto) {
        ContextoTermo contextoSeguro = (contexto != null) ? contexto : new ContextoTermo(null, null, "");
        if (referenciasIds == null || referenciasIds.isEmpty()) {
            throw new IllegalArgumentException("A lista de referências não pode estar vazia.");
        }
        UUID idComodato = referenciasIds.get(0);
        // 1. Busca o comodato completo
        Comodato comodato = repository.findByIdParaTermo(idComodato)
            .orElseThrow(() -> new EntityNotFoundException("Comodato não encontrado ou dados incompletos."));

        ZoneId fusoAcre = ZoneId.of("America/Rio_Branco");
        String dataHojeFormatada = LocalDate.now(fusoAcre).format(formatter);

        // 2. Cria o termo auxiliar
        Termo termoAux = new Termo();
        if (comodato.getTitular() != null && comodato.getTitular().getTipoPerfil() != null) {
            // Pega a modalidade vinculada ao perfil (Monitor -> INICIACAO, Mestrando -> MESTRANDO)
            termoAux.setModalidade(comodato.getTitular().getTipoPerfil().ModalidadeEnum());
        } else {
            termoAux.setModalidade(ModalidadeEnum.COMUM);
        }
        termoAux.setTipoTermo(TipoTermoEnum.COMODATO);

        // FORMATAÇÃO SEGURA NO JAVA (Evita o erro da barra "/" no Thymeleaf)
        String dataInicioFmt =  "__/__/____"; 
            if (comodato.getDataInicio() != null) {
            // Se o sistema salvou "amanhã" porque o servidor virou o dia antes do Acre
            // Você pode subtrair 1 dia manualmente se detectar que está no futuro
            LocalDate dataInicio = comodato.getDataInicio();
            
            // Opcional: Ajuste lógico se a data gravada for maior que "hoje" no Acre
            if (dataInicio.isAfter(LocalDate.now(ZoneId.of("America/Rio_Branco")))) {
                dataInicio = dataInicio.minusDays(1);
            }
            
            dataInicioFmt = dataInicio.format(formatterSimples);
        }
            
        String dataFimFmt = comodato.getDataFimEsperado() != null 
            ? comodato.getDataFimEsperado().format(formatterSimples) : "__/__/____";

        // 3. Prepara o contexto Thymeleaf
        Context context = new Context();
        context.setVariable("comodato", comodato);
        context.setVariable("termo", termoAux);
        context.setVariable("cpfTitular", comodato.getTitular() != null && comodato.getTitular().getCpf() != null ? comodato.getTitular().getCpf() : "000.000.000-00");
        context.setVariable("dataInicioFormatada", dataInicioFmt);
        context.setVariable("dataFimFormatada", dataFimFmt);
        context.setVariable("observacao", contextoSeguro.observacao() != null ? contextoSeguro.observacao() : "");
        context.setVariable("dataFormatada", dataHojeFormatada);

        try {
            // 4. Processa HTML
            String html = templateEngine.process("termo_comodato", context);

            // 5. Converte HTML para PDF
            try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                ITextRenderer renderer = new ITextRenderer();
                renderer.setDocumentFromString(html);
                renderer.layout();
                renderer.createPDF(baos);
                return baos.toByteArray();
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao gerar conteúdo do termo: " + e.getMessage());
        }
    }

    @Override
    public TipoTermoEnum getTipoTermo() {
        return TipoTermoEnum.COMODATO;
    }
}