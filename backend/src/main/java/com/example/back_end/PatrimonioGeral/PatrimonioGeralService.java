package com.example.back_end.PatrimonioGeral;


import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.IntStream;

import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.back_end.Categoria.Categoria;
import com.example.back_end.Categoria.CategoriaRepository;
import com.example.back_end.Localizacao.LocalizacaoRepository;
import com.example.back_end.NotaFiscal.NotaFiscal;
import com.example.back_end.NotaFiscal.NotaFiscalRepository;
import com.example.back_end.NotaFiscal.NotaFiscalService;
import com.example.back_end.PatrimonioEspecifico.EstadoEnum;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecificoService;
import com.example.back_end.PatrimonioEspecifico.Etiqueta.EtiquetaService;
import com.example.back_end.PatrimonioEspecifico.service.PatrimonioEspecificoSequenceService;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;


@Service
public class PatrimonioGeralService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PatrimonioGeralService.class);

    private final PatrimonioGeralRepository repo;
    private final CategoriaRepository catrepo;
    private final NotaFiscalRepository notarepo;
    private final PatrimonioEspecificoService patservice;
    private final LocalizacaoRepository localrepo;
    private final PatrimonioGeralMapper mapper;
    private final NotaFiscalService notaFiscalService;

    private final PatrimonioEspecificoSequenceService sequenceService;
    private final EtiquetaService etiquetaService; 
    // Não esqueça de adicioná-los no construtor da classe!
  

    public PatrimonioGeralService(
            PatrimonioGeralRepository repo,
            PatrimonioEspecificoService patservice,
            CategoriaRepository catrepo,
            NotaFiscalRepository notarepo,
            LocalizacaoRepository localrepo,
            PatrimonioGeralMapper mapper,
            @Lazy NotaFiscalService notaFiscalService,
            PatrimonioEspecificoSequenceService sequenceService,
            EtiquetaService etiquetaService
           ) {
        this.repo = repo;
        this.patservice = patservice;
        this.catrepo = catrepo;
        this.notarepo = notarepo;
        this.localrepo = localrepo;
        this.mapper = mapper;
        this.notaFiscalService = notaFiscalService;
        this.sequenceService = sequenceService;
        this.etiquetaService = etiquetaService;
       
    }

    // --- LEITURA ---
    public Page<PatrimonioGeralDTO> getAll(Pageable paginacao) {
        return repo.findAllWithCategoria(paginacao).map(mapper::toDto);
    }

    // --- CRIAÇÃO ---
    @Transactional 
    public PatrimonioGeral gerarPatrimoniosEspecificos(PatrimonioGeralCreateRequest request) {
       
        int qtd = request.quantidadeOrDefault();

        if (qtd > 1 && request.numSerie() != null && !request.numSerie().isBlank()) {
            throw new IllegalStateException("Não é permitido informar número de série quando a quantidade for maior que 1");
        }

        Categoria categoria = catrepo.findById(request.uuid_categoria())
                .orElseThrow(() -> new EntityNotFoundException("Categoria não encontrada com o ID: " + request.uuid_categoria()));

        NotaFiscal notaFiscal = null;
        if (request.uuid_notaFiscalId() != null) {
            notaFiscal = notarepo.findById(request.uuid_notaFiscalId())
                    .orElseThrow(() -> new EntityNotFoundException("Nota Fiscal não encontrada"));

                    long itensJaVinculados = patservice.contarItensPorNotaFiscal(notaFiscal.getUuid());
            
            // Certifique-se de que o método 'getQuantidadeItensNota()' (ou nome equivalente que você usa) exista na sua entidade NotaFiscal
            if ((itensJaVinculados + qtd) > notaFiscal.getQuantidadeItensNota()) {
                throw new IllegalStateException(
                    "Limite excedido na Nota Fiscal! A nota permite um total de " + notaFiscal.getQuantidadeItensNota() + 
                    " itens. Já existem " + itensJaVinculados + " vinculados e você está tentando adicionar mais " + qtd + "."
                );
            }
        }
        

        var localizacao = localrepo.findById(request.uuid_localizacao())
                .orElseThrow(() -> new EntityNotFoundException("Localização não encontrada"));

        PatrimonioGeral patrimonio = new PatrimonioGeral();
        patrimonio.setDescricao(request.descricao());
        patrimonio.setDataAquisicao(request.dataAquisicao());

        if (request.dataAquisicao().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("A data de aquisição não pode ser posterior a data de hoje!");
        }

        patrimonio.setValorAquisicao(request.valorAquisicao());
        patrimonio.setDataCriacao(request.dataCriacao());
        patrimonio.setCategoria(categoria);
        patrimonio.setNotaFiscal(notaFiscal);
        

       //Aqui se der algo errado é aqui 🙏🙏🙏🙏🙏
        patrimonio.setPatrimonioAutomatico(request.patrimonioAutomatico());
        
        PatrimonioGeral salvo = repo.save(patrimonio);

        // Loop para criar os itens individuais
        // for (int i = 0; i < qtd; i++) {
        //     PatrimonioEspecifico espec = new PatrimonioEspecifico();
        //     espec.setPatrimonioGeral(salvo);
        //     espec.setNumSerie(qtd == 1 ? request.numSerie() : null);
        //     espec.setLocalizacao(localizacao);
        //     espec.setEstado(EstadoEnum.GUARDADO);
        //     patservice.criar(espec);
        // }

        // 1. FASE DE MEMÓRIA: Prepara a lista sem as URLs
        List<PatrimonioEspecifico> listaParaSalvar = new ArrayList<>();
        for (int i = 0; i < qtd; i++) {
            PatrimonioEspecifico espec = new PatrimonioEspecifico();
            espec.setNumPatrimonio(sequenceService.gerarNumPatrimonio()); // Fila com Lock (Seguro!)
            espec.setPatrimonioGeral(salvo);
            espec.setNumSerie(qtd == 1 ? request.numSerie() : null);
            espec.setLocalizacao(localizacao);
            espec.setEstado(EstadoEnum.GUARDADO);
            listaParaSalvar.add(espec);
        }

        // 2. FASE DO BANCO INICIAL: Salva para o Hibernate gerar os UUIDs reais
        listaParaSalvar = patservice.preSalvarLote(listaParaSalvar);

        // 3. FASE DA REDE EM PARALELO: Manda as Threads baterem no Cloudinary simultaneamente
        listaParaSalvar.parallelStream().forEach(espec -> {
            Map<String, String> urls = etiquetaService.gerarEtiqueta(espec.getNumPatrimonio(), espec.getUuid());
            espec.setEtiquetaUrlPreta(urls.get("urlPreta"));
            espec.setEtiquetaUrlBranca(urls.get("urlBranca"));
        });

        // 4. FASE FINAL DO BANCO: Atualiza as URLs preenchidas e audita
        patservice.finalizarLoteComAuditoria(listaParaSalvar);

        if (salvo.getNotaFiscal() != null) {
            notaFiscalService.verificarEAtualizarStatus(salvo.getNotaFiscal().getUuid());
        }

        return salvo;
    }

    // --- ATUALIZAÇÃO REFINADA (COM LOG DE DE/PARA) ---
    @Transactional
    public PatrimonioGeral atualizarPatrimonio(UUID uuid, PatrimonioGeral novosDados, UUID categoriaId, UUID notaFiscalId) {
        // 1. Busca Antigo
        PatrimonioGeral entidadeAntiga = repo.findByUuidWithCategoria(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Patrimônio Geral não encontrado"));


       

        // 3. Aplica as alterações no objeto real (Java)
        entidadeAntiga.setDescricao(novosDados.getDescricao());
        entidadeAntiga.setDataAquisicao(novosDados.getDataAquisicao());
        entidadeAntiga.setValorAquisicao(novosDados.getValorAquisicao());
        
        // Atualiza Categoria
        if (categoriaId != null) {
            entidadeAntiga.setCategoria(catrepo.findById(categoriaId)
                    .orElseThrow(() -> new EntityNotFoundException("Categoria não encontrada")));
        } else {
            entidadeAntiga.setCategoria(null);
        }
        
        // Atualiza Nota Fiscal - A CORREÇÃO PRINCIPAL ESTÁ AQUI
        if (notaFiscalId != null) {
            entidadeAntiga.setNotaFiscal(notarepo.findById(notaFiscalId)
                    .orElseThrow(() -> new EntityNotFoundException("Nota Fiscal não encontrada")));
            if (entidadeAntiga.getNotaFiscal() != null) {
            notaFiscalService.verificarEAtualizarStatus(entidadeAntiga.getNotaFiscal().getUuid());
        }
        } else {
            // Se veio null, removemos a nota
            // ISSO AQUI È MUITO ESTRANHO
            entidadeAntiga.setNotaFiscal(null);
        }

        // 4. Salva no MySQL
        PatrimonioGeral salvo = repo.save(entidadeAntiga);

       

        return salvo;
    }

    // --- OUTROS ---
    public void movimentarVariosCategoria(CategoriaMovementDTO dto) {
        repo.moverPatrimoniosEmMassaCategoria(dto.patrimonioIDS(), dto.novoCategoria());
        // Idealmente adicionar log aqui também
    }

    public void delete(UUID uuid) {

        repo.deleteById(uuid);
    }
}