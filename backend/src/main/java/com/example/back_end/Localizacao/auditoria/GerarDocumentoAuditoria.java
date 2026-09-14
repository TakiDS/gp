package com.example.back_end.Localizacao.auditoria;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.back_end.Localizacao.Localizacao;
import com.example.back_end.Localizacao.LocalizacaoRepository;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;

@Service
public class GerarDocumentoAuditoria {

    private final LocalizacaoRepository localizacaoRepository;
    private final PdfService pdfService;

    public GerarDocumentoAuditoria(LocalizacaoRepository localizacaoRepository, PdfService pdfService) {
        this.localizacaoRepository = localizacaoRepository;
        this.pdfService = pdfService;
    }

    public DadosImpressaoAuditoria prepararDadosParaAuditoria(UUID uuid) {
    // Busca a entidade com a lista de patrimônios carregada
    Localizacao localizacao = localizacaoRepository.findWithPatrimonioByUuid(uuid)
        .orElseThrow(() -> new RuntimeException("Localização não encontrada"));

    // Agrupa em memória: Chave = Nome da Categoria, Valor = Lista de Patrimônios
    Map<String, List<PatrimonioEspecifico>> agrupadoPorCategoria = localizacao.getPatrimonio()
        .stream().sorted(Comparator.comparing(PatrimonioEspecifico::getNumPatrimonio, String.CASE_INSENSITIVE_ORDER))
            .collect(Collectors.groupingBy(p -> {
                if (p.getPatrimonioGeral() != null && p.getPatrimonioGeral().getCategoria() != null) {
                    return p.getPatrimonioGeral().getCategoria().getNome();
                }
                return "Sem Categoria";
            }, 
            () -> new TreeMap<>(String.CASE_INSENSITIVE_ORDER), 
            Collectors.toList()));
            
        // Ajuste o construtor ou passe o valor no Service
        return new DadosImpressaoAuditoria(
            localizacao.getLocal(), 
            localizacao.getTotalPatrimonio(),
            java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")), // Adicionada a data
            agrupadoPorCategoria
        );
    }

    public String gerarEAtualizarTermo(UUID uuid) {
    // 1. Prepara os dados (o método que você já criou)
    DadosImpressaoAuditoria dados = prepararDadosParaAuditoria(uuid);
    
    // 2. Gera o PDF usando o Thymeleaf e o motor de conversão (ex: OpenHTMLtoPDF)
        String urlPdf = pdfService.gerarPdf(dados); // Retorna a URL ou path do arquivo
        
        // 3. Atualiza apenas o último registro na localização
        Localizacao loc = localizacaoRepository.findById(uuid).orElseThrow(
            () -> new RuntimeException("Localização não encontrada")
        );
        loc.setTermoAuditoriaUrl(urlPdf);
        localizacaoRepository.save(loc);
        
        return urlPdf;
    }
}
