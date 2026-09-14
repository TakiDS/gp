package com.example.back_end.PatrimonioEspecifico.service;

import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.back_end.Infra.cloudinary.CloudinaryService;
import com.example.back_end.PatrimonioEspecifico.Etiqueta.EtiquetaDto;
import com.example.back_end.PatrimonioEspecifico.Etiqueta.EtiquetaService;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecificoRepository;

import jakarta.persistence.EntityNotFoundException;

/**
 * Serviço responsável por operações com etiquetas de patrimônio.
 * Responsabilidade única: Geração, salvamento e download de etiquetas.
 */
@Service
public class PatrimonioEspecificoEtiquetaService {

    private final PatrimonioEspecificoRepository repository;
    private final EtiquetaService etiquetaService;
    private final CloudinaryService cloudinaryService;

    public PatrimonioEspecificoEtiquetaService(
            PatrimonioEspecificoRepository repository,
            EtiquetaService etiquetaService,
            CloudinaryService cloudinaryService
    ) {
        this.repository = repository;
        this.etiquetaService = etiquetaService;
        this.cloudinaryService = cloudinaryService;
    }

    /**
     * Gera etiqueta para um patrimônio, salva a URL e persiste no banco.
     */
    @Transactional
    public void gerarESalvarEtiqueta(PatrimonioEspecifico patrimonio) {
        Map<String, String> urls = etiquetaService.gerarEtiqueta(
                patrimonio.getNumPatrimonio(),
                patrimonio.getUuid()
        );
        patrimonio.setEtiquetaUrlPreta(urls.get("urlPreta"));
        patrimonio.setEtiquetaUrlBranca(urls.get("urlBranca"));
        
        repository.save(patrimonio);
    }

    /**
     * Gera uma etiqueta e retorna seu DTO (apenas o resultado, sem persistir).
     */
    public EtiquetaDto gerarEtiqueta(UUID uuid) {
        PatrimonioEspecifico patrimonio = repository.findById(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Patrimônio não encontrado"));

        Map<String, String> urls = etiquetaService.gerarEtiqueta(
                patrimonio.getNumPatrimonio(),
                patrimonio.getUuid()
        );

        patrimonio.setEtiquetaUrlPreta(urls.get("urlPreta"));
        patrimonio.setEtiquetaUrlBranca(urls.get("urlBranca"));

        repository.save(patrimonio);

        return new EtiquetaDto(uuid, urls.get("urlPreta"), urls.get("urlBranca"));
    }

    /**
     * Baixa o arquivo de etiqueta do Cloudinary.
     */
    public byte[] baixarEtiqueta(UUID uuid, boolean isBranca) {
        PatrimonioEspecifico patrimonio = repository.findById(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Patrimônio não encontrado: " + uuid));

        String urlValidacao = isBranca ? patrimonio.getEtiquetaUrlBranca() : patrimonio.getEtiquetaUrlPreta();

        if (patrimonio.getEtiquetaUrlPreta() == null && patrimonio.getEtiquetaUrlBranca() == null) {
            throw new IllegalStateException("Etiqueta ainda não gerada.");
        }

        String identificador = uuid.toString() + (isBranca ? "-branco" : "-preto");
        
        return cloudinaryService.downloadEtiqueta(identificador);
    }

    /**
     * Retorna todas as URLs de etiquetas cadastradas no sistema.
     */
    @Transactional(readOnly = true)
    public java.util.List<String> retornarTodasEtiquetas() {
        return repository.findAllEtiquetaUrls();
    }
}
