package com.example.back_end.Localizacao;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecificoRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;

@Service
public class LocalizacaoService {
    
    private final LocalizacaoRepository repository;
    private final PatrimonioEspecificoRepository patrimonioEspecificoRepository;

    public LocalizacaoService(LocalizacaoRepository repository, PatrimonioEspecificoRepository patrimonioEspecificoRepository) {
        this.repository = repository;
        this.patrimonioEspecificoRepository = patrimonioEspecificoRepository;
    }

    //salvar
    public Localizacao salvar(@Valid Localizacao objeto) {
        boolean existe = repository.existsByLocalIgnoreCase(objeto.getLocal());

        if(existe) {
            throw new IllegalStateException("Já existe um local com esse nome.");
        }

        return repository.save(objeto);
    }

    //consultar(ok)
    @Transactional(readOnly=true)
    public Page<Localizacao> consultar(String termoBusca, Pageable pagincao) {
        if(termoBusca != null && !termoBusca.isBlank()) {
            return repository.consultar(termoBusca, pagincao);
        }
        return repository.findAll(pagincao);
    }

    //consultarPorId
    //retornar patrimonios especificos de localizacao x
    public Localizacao buscarPorUuid(UUID uuid, String termoBusca, Pageable paginacao) {
        Localizacao localizacao = repository.findById(uuid).orElseThrow(
            () -> new RuntimeException("Localização não encontrada: " + uuid));

            if(termoBusca != null && !termoBusca.isEmpty()) {
                Page<PatrimonioEspecifico> patrimonios = patrimonioEspecificoRepository.findByLocalizacao(localizacao, termoBusca, paginacao);
                localizacao.setPatrimonio(patrimonios.getContent());
            }

            
        return localizacao;
    }

    //atualizar
    public Localizacao atualizar(UUID uuid, Localizacao objeto) {
        Localizacao atual = repository.findById(uuid).orElseThrow(
            () -> new EntityNotFoundException("Localização não encontrada: "));
        
        boolean existente = repository.existsByLocalIgnoreCaseAndUuidNot(objeto.getLocal(), uuid);

        if (existente) {
            throw new IllegalStateException("Já existe outra localização com esse nome.");
        }

        atual.setLocal(objeto.getLocal());
        return repository.save(atual);
    }

    //deletar
    public void deletar(UUID uuid) {
        repository.findById(uuid);
    }

}
