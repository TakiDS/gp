package com.example.back_end.NfeConsulta;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import br.com.swconsultoria.certificado.Certificado;
import br.com.swconsultoria.certificado.CertificadoService;
import br.com.swconsultoria.nfe.Nfe;
import br.com.swconsultoria.nfe.dom.ConfiguracoesNfe;
import br.com.swconsultoria.nfe.dom.Evento;
import br.com.swconsultoria.nfe.dom.enuns.AmbienteEnum;
import br.com.swconsultoria.nfe.dom.enuns.ConsultaDFeEnum;
import br.com.swconsultoria.nfe.dom.enuns.EstadosEnum;
import br.com.swconsultoria.nfe.dom.enuns.ManifestacaoEnum;
import br.com.swconsultoria.nfe.dom.enuns.PessoaEnum;
import br.com.swconsultoria.nfe.schema.envConfRecebto.TEnvEvento;
import br.com.swconsultoria.nfe.schema.envConfRecebto.TRetEnvEvento;
import br.com.swconsultoria.nfe.schema.retdistdfeint.RetDistDFeInt;
import br.com.swconsultoria.nfe.util.ManifestacaoUtil;
import br.com.swconsultoria.nfe.util.XmlNfeUtil;
import com.example.back_end.Infra.seguranca.service.SensitiveDataCryptoService;

@Service
public class SefazNfeService {

    private static final Logger log = LoggerFactory.getLogger(SefazNfeService.class);

    //Vou armazenar no banco de dados
    // @Value("${sefaz.certificado.caminho}")
    // private String caminhoCertificado;
    // @Value("${sefaz.certificado.senha}")
    // private String senhaCertificado;
    @Autowired
    private CertificadoDigitalRepository certificadoRepository;

    @Autowired
    private SensitiveDataCryptoService cryptoService;

    @Value("${sefaz.schemas.caminho}")
    private String caminhoSchemas;

    private final String cnpjFundape = "02646829000191";

    public byte[] buscarXmlCompleto(String chaveAcesso) throws Exception {
        log.info("Iniciando busca da chave {} direto na SEFAZ", chaveAcesso);

        CertificadoDigital certDb = certificadoRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Certificado Digital não encontrado no banco de dados! Faça o upload primeiro."));

        byte[] arquivoPfx = cryptoService.decrypt(certDb.getArquivoPfx());
        String senha = cryptoService.decryptString(certDb.getSenha());
        Certificado certificado = CertificadoService.certificadoPfxBytes(arquivoPfx, senha);

        ConfiguracoesNfe config = ConfiguracoesNfe.criarConfiguracoes(EstadosEnum.AC, AmbienteEnum.PRODUCAO, certificado, caminhoSchemas);

        Evento evento = new Evento();
        evento.setChave(chaveAcesso);
        evento.setCnpj(cnpjFundape);
        evento.setDataEvento(LocalDateTime.now());
        // Usando CONFIRMAÇÃO para aceitar notas entre 10 e 180 dias
        evento.setTipoManifestacao(ManifestacaoEnum.CONFIRMACAO_DA_OPERACAO);

        TEnvEvento eventoManifestacao = ManifestacaoUtil.montaManifestacao(evento, config);
        TRetEnvEvento retornoManifestacao = Nfe.manifestacao(config, eventoManifestacao, true);

        if ("128".equals(retornoManifestacao.getCStat())) {
            String cStatEvento = retornoManifestacao.getRetEvento().get(0).getInfEvento().getCStat();

            if ("135".equals(cStatEvento) || "573".equals(cStatEvento)) {
                log.info("Manifestação confirmada na SEFAZ. Aguardando processamento...");
                Thread.sleep(3000); // Pausa estratégica

                RetDistDFeInt retornoConsulta = Nfe.distribuicaoDfe(
                        config, PessoaEnum.JURIDICA, cnpjFundape, ConsultaDFeEnum.CHAVE, chaveAcesso
                );

                if ("138".equals(retornoConsulta.getCStat())) {
                    // Pega o primeiro XML zipado da lista e converte
                    String xmlString = XmlNfeUtil.gZipToXml(retornoConsulta.getLoteDistDFeInt().getDocZip().get(0).getValue());
                    return xmlString.getBytes(StandardCharsets.UTF_8);
                } else {
                    throw new RuntimeException("Nota não liberada para download. CStat: " + retornoConsulta.getCStat());
                }
            } else {
                throw new RuntimeException("Erro na manifestação: " + cStatEvento);
            }
        } else {
            throw new RuntimeException("Erro no lote: " + retornoManifestacao.getCStat());
        }
    }
}
