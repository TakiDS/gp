package com.example.back_end.Categoria;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.back_end.Infra.excecoes.BusinessException;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecificoMapper;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecificoRepository;
import com.example.back_end.PatrimonioGeral.PatrimonioGeralRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class CategoriaService {
    private final CategoriaRepository repo;
    private final PatrimonioGeralRepository patrepo;
    private final PatrimonioEspecificoMapper patemapper;
    private final PatrimonioEspecificoRepository paterepo;

    //Construtor obrigatorio para inicializar o CategoriaRepository
    public CategoriaService(CategoriaRepository repo, PatrimonioGeralRepository patrepo, PatrimonioEspecificoMapper patemapper, PatrimonioEspecificoRepository paterepo){
        this.repo = repo;
        this.patrepo = patrepo;
        this.patemapper = patemapper;
        this.paterepo = paterepo;
    }

    //LISTAR
    public Page<Categoria> consultar(String termoBusca, Pageable paginacao) {
        if (termoBusca != null && !termoBusca.isEmpty()) {
            return repo.findByNomeContainingIgnoreCase(termoBusca, paginacao);
        }
        return repo.findAll(paginacao);
    }

    // Calcular total de patrimônio por categoria
    public int contarPatrimonioPorCategoria(UUID uuidCategoria) {
        return repo.countByCategoria(uuidCategoria);
    }

    //LISTAR POR ID
    // public Categoria consultarPorUuid(UUID uuid) {
    //     return repo.findById(uuid).orElseThrow(
    //         ()-> new EntityNotFoundException("Categoria não encontrada: " + uuid));
    // }
    public CategoriaResponsePatDto consultarPorUuid(UUID uuid, 
            String termoBusca,
            Pageable paginacao
        ) {
        Categoria categoria = repo.findById(uuid).orElseThrow(
            () -> new EntityNotFoundException("Categoria não encontrada: " + uuid));

        Page<PatrimonioEspecifico> especificos = paterepo.findByTermoBusca(
            categoria, termoBusca, paginacao
        );

        int totalPatrimonio = contarPatrimonioPorCategoria(categoria.getUuid());

        return new CategoriaResponsePatDto(
            categoria.getUuid(),
            categoria.getNome(),
            categoria.getDescricao(),
            totalPatrimonio,
            especificos.map(patemapper::toDto)
        );
    }

    //CRIAR 
    public Categoria save(Categoria categoria){
        boolean existe = repo.existsByNomeIgnoreCase(categoria.getNome());

        if(existe) {
            throw new IllegalStateException("Esse nome pertence a uma categoria já existente.");
        }

        return repo.save(categoria);
    }

    //ATUALIZAR (tem que ver se vai poder atualizar categoria)
    public Categoria atualizarCategoria(UUID uuid, Categoria categoria) {
        Categoria atual = repo.findById(uuid)
        .orElseThrow(() -> new EntityNotFoundException("Categoria não encontrada: " + uuid));

        boolean existe = repo.existsByNomeIgnoreCaseAndUuidNot(atual.getNome(), uuid);

        if(existe) {
            throw new IllegalStateException("Já existe categoria com esse nome.");
        }

        atual.setNome(categoria.getNome());
        atual.setDescricao(categoria.getDescricao());

        return repo.save(atual);
    }

    //DELETAR
    public void deletar(UUID uuid){
        repo.findById(uuid).orElseThrow(() -> new EntityNotFoundException("Categoria inexistente."));

        boolean existe = repo.existsByPatrimonioGeralUuid(uuid);

        if(existe) {
            throw new BusinessException("Não é possível excluir a categoria: existem patrimônio vinculados");
        }

        repo.deleteById(uuid);
    }
}
