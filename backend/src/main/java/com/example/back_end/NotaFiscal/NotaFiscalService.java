package com.example.back_end.NotaFiscal;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.back_end.Infra.Gemini.GeminiService;
import com.example.back_end.Infra.cloudinary.CloudinaryService;
import com.example.back_end.NfeConsulta.SefazNfeService;
import com.example.back_end.NotaFiscal.Services.DanfeGeneratorService;
import com.example.back_end.NotaFiscal.Services.NotaFiscalKeyExtractor;
import com.example.back_end.NotaFiscal.Services.NotaFiscalXmlProcessor;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecificoRepository;
import com.example.back_end.WebScrap.DanfeRapidaService;
import com.example.back_end.WebScrap.DanfeResponse;

@Service
public class NotaFiscalService {

    private static final Logger log = LoggerFactory.getLogger(NotaFiscalService.class);

    private final NotaFiscalRepository repo;
    private final CloudinaryService cloudinaryService;
    private final DanfeRapidaService danfeRapidaService;
    private final GeminiService geminiService;
    private final PatrimonioEspecificoRepository patrimonioEspecificoRepo;

    // Novas dependências injetadas
    private final NotaFiscalKeyExtractor keyExtractor;
    private final NotaFiscalXmlProcessor xmlProcessor;
    private final DanfeGeneratorService danfeGeneratorService; // <-- NOVO SERVIÇO AQUI
    private final SefazNfeService sefazNfeService;

    public NotaFiscalService(
            NotaFiscalRepository repo,
            CloudinaryService cloudinaryService,
            DanfeRapidaService danfeRapidaService,
            GeminiService geminiService,
            PatrimonioEspecificoRepository patrimonioEspecificoRepo,
            NotaFiscalKeyExtractor keyExtractor,
            NotaFiscalXmlProcessor xmlProcessor,
            DanfeGeneratorService danfeGeneratorService,
            SefazNfeService sefazNfeService
    ) {
        this.repo = repo;
        this.cloudinaryService = cloudinaryService;
        this.danfeRapidaService = danfeRapidaService;
        this.geminiService = geminiService;
        this.patrimonioEspecificoRepo = patrimonioEspecificoRepo;
        this.keyExtractor = keyExtractor;
        this.xmlProcessor = xmlProcessor;
        this.danfeGeneratorService = danfeGeneratorService;
        this.sefazNfeService = sefazNfeService;
    }

    public NotaFiscal createWithUpload(MultipartFile file, UUID categoria, UUID localizacao) throws IOException {
        String nomeOriginal = Objects.requireNonNull(file.getOriginalFilename(), "Arquivo sem nome").toLowerCase();
        byte[] arquivoBytes = file.getBytes();

        String xmlConteudoFinal;
        String chaveExtraida;

        // Mantém o arquivo original por padrão para o upload
        byte[] pdfParaUpload = arquivoBytes;

        // 1. Estratégia de Extração
        if (nomeOriginal.endsWith(".xml")) {
            xmlConteudoFinal = new String(arquivoBytes, StandardCharsets.UTF_8);
            chaveExtraida = keyExtractor.extrairChaveDeXmlString(xmlConteudoFinal);

            // O usuário subiu um XML nu e cru. Geramos um PDF visual para ele.
            pdfParaUpload = danfeGeneratorService.gerarPdfDoXml(arquivoBytes);
            log.info("PDF do DANFE gerado localmente a partir do XML do usuário.");

        } else {
            // O usuário subiu um PDF ou Imagem. Vamos preservar esse arquivo!
            chaveExtraida = keyExtractor.extrairChaveHierarquicoLocal(arquivoBytes);

            if (chaveExtraida == null) {
                log.warn("Scan local falhou. Acionando Gemini...");
                chaveExtraida = geminiService.buscarNoGemini(arquivoBytes);
            }

            if (!keyExtractor.validarChave(chaveExtraida)) {
                throw new RuntimeException("Não foi possível ler a chave da nota.");
            }

            String chaveLimpaParaBusca = keyExtractor.limparChave(chaveExtraida);
            byte[] xmlBytes = null;

            // ---- A MÁGICA DO ROTEAMENTO AQUI ----
            // 1. Tenta a SEFAZ se a nota tiver menos de 6 meses
            if (keyExtractor.isChaveRecenteParaSefaz(chaveLimpaParaBusca)) {
                try {
                    log.info("Chave recente identificada. Tentando buscar de graça via SEFAZ...");
                    xmlBytes = sefazNfeService.buscarXmlCompleto(chaveLimpaParaBusca);
                    log.info("Sucesso ao buscar XML na SEFAZ!");
                } catch (Exception e) {
                    log.error("ESTOUROU ERRO NA SEFAZ AQUI:", e); // O 'e' no final faz o Spring imprimir todas as linhas do erro!
                    log.warn("Acionando Fallback para API paga...");
                    // xmlBytes continua nulo, então ele vai cair no próximo IF
                }
            } else {
                log.info("Chave antiga (> 6 meses). Pulando SEFAZ para evitar erro.");
            }

            // 2. Fallback: Se não tentou a SEFAZ ou se a SEFAZ falhou, usa a API Paga
            if (xmlBytes == null) {
                log.info("Buscando XML pela API DanfeRapida (Paga)...");
                DanfeResponse response = danfeRapidaService.buscarXmlPelaChave(chaveLimpaParaBusca);
                xmlBytes = response.getXmlBytes();
            }

            // Atribui o resultado final
            xmlConteudoFinal = new String(xmlBytes, StandardCharsets.UTF_8);

            log.info("Mantendo o PDF/Imagem original enviado pelo usuário para o upload.");
        }

        // 2. Validação de Duplicidade
        String chaveLimpa = keyExtractor.limparChave(chaveExtraida);
        if (repo.existsByChaveAcesso(chaveLimpa)) {
            log.warn("Tentativa de cadastrar nota duplicada: {}", chaveLimpa);
        }

        // 3. Upload Cloudinary
        log.info("Chave: {}. Realizando upload para o Cloudinary...", chaveExtraida);
        Map<String, Object> uploadResult = cloudinaryService.uploadBytes(pdfParaUpload);

        // 4. Preparação do Objeto
        NotaFiscal notaFiscal = new NotaFiscal();
        notaFiscal.setNotaFiscalUrl((String) uploadResult.get("secure_url"));
        notaFiscal.setChaveAcesso(chaveLimpa);
        notaFiscal.setCriadoAutomatico(true);

        // 5. Processamento do XML (Delega para o Processor)
        return xmlProcessor.processarFluxoXml(xmlConteudoFinal, notaFiscal, categoria, localizacao);
    }

    public NotaFiscal createManualWithUpload(MultipartFile file, NotaFiscalManualRequest request) throws IOException {
        Map<String, Object> uploadResult = cloudinaryService.uploadNotaFiscal(file);

        if (request.valorTotalNota() == null) {
            throw new IllegalArgumentException("O valor da nota não pode ser nulo");
        }

        if (request.valorTotalNota().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("O valor da nota não pode ser 0");
        }

        if (request.quantidadeItensNota() <= 0) {
            throw new IllegalArgumentException("A quantidade tem que ser maior que 0");
        }

        if (request.dataEmissao() != null && request.dataEmissao().isAfter(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("A data de emissão da nota fiscal não pode estar no futuro!");
        }

        NotaFiscal nota = new NotaFiscal();
        nota.setNotaFiscalUrl((String) uploadResult.get("secure_url"));
        nota.setFornecedor(request.fornecedor());
        nota.setCnpj(request.cnpj());
        nota.setValorTotalNota(request.valorTotalNota());
        nota.setDataEmissao(request.dataEmissao());
        nota.setQuantidadeItensNota(request.quantidadeItensNota());
        nota.setCodigoNota(String.format("NF-%06d", repo.count() + 1));
        nota.setStatus(StatusNota.SEM_PATRIMONIOS);
        nota.setDataCriacao(LocalDateTime.now());

        return repo.save(nota);
    }

    public void verificarEAtualizarStatus(UUID notaUuid) {
        NotaFiscal nota = repo.findById(notaUuid)
                .orElseThrow(() -> new RuntimeException("Nota Fiscal não encontrada."));

        long totalEspecificosNoBanco = patrimonioEspecificoRepo.countByNotaFiscalUuid(notaUuid);

        // 1. Se não tem NENHUM patrimônio vinculado:
        if (totalEspecificosNoBanco == 0) {
            nota.setStatus(StatusNota.SEM_PATRIMONIOS);
        } 
        // 2. Se a quantidade vinculada já bate (ou passa) a quantidade da nota:
        else if (totalEspecificosNoBanco >= nota.getQuantidadeItensNota()) {
            nota.setStatus(StatusNota.TOTALMENTE_VINCULADA);
        } 
        // 3. Se tem mais que 0, mas menos que o total:
        else {
            nota.setStatus(StatusNota.PARCIALMENTE_VINCULADA);
        }
        
        repo.save(nota);
    }

    // --- MÉTODOS CRUD PADRÃO ---
    public Page<NotaFiscal> getAll(Pageable paginacao) {
        return repo.findAll(paginacao);
    }

    public Page<NotaFiscalDTO> buscarPorTermo(String termo, Pageable paginacao) {
        return repo.pesquisar(termo, paginacao).map(NotaFiscalMapper::toDTO);
    }

    public NotaFiscal buscaId(UUID uuid) {
        return repo.findById(uuid).orElseThrow(() -> new RuntimeException("Nota não encontrada!"));
    }

    public void delete(UUID uuid) {
        repo.deleteById(uuid);
    }

    public NotaFiscal atualizarNotaFiscal(UUID uuid, NotaFiscalUpdateRequest request) {
        // 1. Busca a nota existente (ou lança exceção se não achar)
        NotaFiscal existente = buscaId(uuid);

        // --- NOVA TRAVA DE SEGURANÇA AQUI ---
        if (existente.isCriadoAutomatico()) {
            throw new IllegalStateException("Notas fiscais importadas automaticamente via XML ou SEFAZ não podem ser editadas.");
        }
        // ------------------------------------

        // 2. Atualiza apenas os campos permitidos, desde que não venham nulos do Front
        if (request.fornecedor() != null) {
            existente.setFornecedor(request.fornecedor());
        }
        if (request.cnpj() != null) {
            existente.setCnpj(request.cnpj());
        }
        if (request.valorTotalNota() != null) {
            if (request.valorTotalNota().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("O valor da nota não pode ser 0 ou negativo.");
            }
            existente.setValorTotalNota(request.valorTotalNota());
        }
        if (request.dataEmissao() != null) {

            if (request.dataEmissao().isAfter(java.time.LocalDate.now())) {
                throw new IllegalArgumentException("A data de emissão da nota fiscal não pode estar no futuro!");
            }

            existente.setDataEmissao(request.dataEmissao());
        }
        if (request.quantidadeItensNota() != null) {
            if (request.quantidadeItensNota() <= 0) {
                throw new IllegalArgumentException("A quantidade de itens deve ser maior que 0.");
            }
            existente.setQuantidadeItensNota(request.quantidadeItensNota());
            
            // Reavalia o status da nota já que a quantidade total esperada mudou
            this.verificarEAtualizarStatus(existente.getUuid()); 
        }

        // 3. Salva a entidade existente atualizada
        return repo.save(existente);
    }

    @Transactional(readOnly = true)
    public Page<NotaFiscalDTO> consultarPorFiltros(
            String termoBusca, 
            StatusNota status, 
            LocalDate dataInicio, 
            LocalDate dataFim, 
            Pageable paginacao) {
            
        return repo.findByFiltros(termoBusca, status, dataInicio, dataFim, paginacao)
                   .map(NotaFiscalMapper::toDTO); // Use a sua classe de mapeamento de DTO aqui
    }
}
