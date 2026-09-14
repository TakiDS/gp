package com.example.back_end.NotaFiscal.Services;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import javax.xml.parsers.DocumentBuilderFactory;

import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import com.example.back_end.NotaFiscal.NotaFiscal;
import com.example.back_end.NotaFiscal.NotaFiscalRepository;
import com.example.back_end.NotaFiscal.StatusNota;
import com.example.back_end.PatrimonioGeral.PatrimonioGeralCreateRequest;
import com.example.back_end.PatrimonioGeral.PatrimonioGeralService;

@Component
public class NotaFiscalXmlProcessor {

    private final NotaFiscalRepository repo;
    private final PatrimonioGeralService patrimonioGeralService;

    public NotaFiscalXmlProcessor(NotaFiscalRepository repo, PatrimonioGeralService patrimonioGeralService) {
        this.repo = repo;
        this.patrimonioGeralService = patrimonioGeralService;
    }

    public NotaFiscal processarFluxoXml(String xml, NotaFiscal nota, UUID catUuid, UUID locUuid) {
        try {
            InputStream is = new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8));
            Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(is);
            doc.getDocumentElement().normalize();

            
            // Se a nota já vem com a chave do service anterior, use ela:
            if (nota.getChaveAcesso() != null && repo.existsByChaveAcesso(nota.getChaveAcesso())) {
                throw new RuntimeException("Esta Nota Fiscal já foi processada anteriormente.");
            }

            // 2. Preenche os dados
            preencherDadosCabecalho(doc, nota);

            

            nota.setStatus(StatusNota.SEM_PATRIMONIOS);
            nota.setDataCriacao(LocalDateTime.now());

            NotaFiscal notaSalva = repo.save(nota);

            // Gera os patrimônios baseados nos itens do XML
            processarProdutosXml(doc, notaSalva, catUuid, locUuid);

            return notaSalva;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar XML: " + e.getMessage());
        }
    }

    private void preencherDadosCabecalho(Document doc, NotaFiscal nota) {
        // Lógica de dEmi, dhEmi, CNPJ, xNome, vNF
        NodeList dataNode = doc.getElementsByTagName("dhEmi");
        if (dataNode.getLength() == 0) {
            dataNode = doc.getElementsByTagName("dEmi");
        }
        if (dataNode.getLength() > 0) {
            String rawDate = dataNode.item(0).getTextContent();
            if (rawDate.length() >= 10) {
                nota.setDataEmissao(LocalDate.parse(rawDate.substring(0, 10)));
            }
        }

        Element emit = (Element) doc.getElementsByTagName("emit").item(0);
        nota.setCnpj(getTagValue("CNPJ", emit));
        nota.setFornecedor(getTagValue("xNome", emit));

        if (doc.getElementsByTagName("vNF").getLength() > 0) {
            nota.setValorTotalNota(new BigDecimal(doc.getElementsByTagName("vNF").item(0).getTextContent()));
        }

        // --- CORREÇÃO DA QUANTIDADE AQUI ---
        NodeList listaDet = doc.getElementsByTagName("det");
        int quantidadeTotal = 0;
        
        for (int i = 0; i < listaDet.getLength(); i++) {
            Element detElement = (Element) listaDet.item(i);
            Element prodElement = (Element) detElement.getElementsByTagName("prod").item(0);
            
            String qComStr = getTagValue("qCom", prodElement);
            if (!qComStr.isEmpty()) {
                // Transforma "4.0000" em 4 e soma no total
                quantidadeTotal += (int) Double.parseDouble(qComStr); 
            }
        }
        nota.setQuantidadeItensNota(quantidadeTotal); // Agora vai salvar 26!
        // -----------------------------------

        // Lógica do nNF
        if (doc.getElementsByTagName("ide").getLength() > 0) {
            //String numeroNota = getTagValue("nNF", (Element) doc.getElementsByTagName("ide").item(0)); Viagem isso aqui
            nota.setCodigoNota(String.format("NF-%06d", repo.count() + 1));
        }
    }

    private void processarProdutosXml(Document doc, NotaFiscal nota, UUID catUuid, UUID locUuid) {
        NodeList lista = doc.getElementsByTagName("det");
        for (int i = 0; i < lista.getLength(); i++) {
            Element el = (Element) lista.item(i);
            Element prod = (Element) el.getElementsByTagName("prod").item(0);

            patrimonioGeralService.gerarPatrimoniosEspecificos(new PatrimonioGeralCreateRequest(
                    getTagValue("xProd", prod),
                    nota.getDataEmissao(),
                    new BigDecimal(getTagValue("vUnCom", prod)),
                    LocalDateTime.now(),
                    null,
                    catUuid,
                    nota.getUuid(),
                    locUuid,
                    (int) Double.parseDouble(getTagValue("qCom", prod)),
                    true
                ));
        }
        nota.setStatus(StatusNota.TOTALMENTE_VINCULADA);
        repo.save(nota);
    }

    private String getTagValue(String tag, Element el) {
        NodeList nl = el.getElementsByTagName(tag);
        return nl.getLength() > 0 ? nl.item(0).getTextContent() : "";
    }
}
