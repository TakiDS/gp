package com.example.back_end.Comodato.termos;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.back_end.Comodato.Comodato;
import com.example.back_end.Comodato.ComodatoRepository;
import com.example.back_end.Infra.cloudinary.CloudinaryService;

import jakarta.transaction.Transactional;

@Service
public class TermoService {

    private final Map<TipoTermoEnum, GeradorTermo> estrategias;
    private final CloudinaryService cloudinaryService;
    private final TermoRepository termoRepository;
    private final ComodatoRepository repository;

    public TermoService(List<GeradorTermo> listaDeEstrategias, CloudinaryService cloudinaryService, TermoRepository termoRepository, ComodatoRepository repository) {
        this.estrategias = listaDeEstrategias.stream().collect(Collectors.toMap(GeradorTermo::getTipoTermo, Function.identity()));
        this.cloudinaryService = cloudinaryService;
        this.termoRepository = termoRepository;
        this.repository = repository;
    }

    @Transactional
    public TermoComBytes gerarSalvarEUpload(TipoTermoEnum tipo, List<UUID> referenciaisId, ContextoTermo contexto) {
        GeradorTermo estrategia = estrategias.get(tipo);
        if (estrategia == null) {
            throw new UnsupportedOperationException("Estratégia não encontrada para: " + tipo);
        }

        // 1. Gera o PDF (Bytes)
        byte[] pdfBytes = estrategia.gerarPdf(referenciaisId, contexto);

        try {
            // 2. Sobe para o Cloudinary
            String publicId = tipo.name().toLowerCase() + "-" + UUID.randomUUID();
            Map<String, Object> uploadResult = cloudinaryService.uploadTermoPdf(pdfBytes, publicId);
            String urlFinal = (String) uploadResult.get("secure_url");

            if (tipo == TipoTermoEnum.COMODATO) {
            UUID comodatoId = referenciaisId.get(0);
            Comodato comodato = repository.findById(comodatoId).orElseThrow(
                () -> new RuntimeException("Comodato não encontrado"));
            comodato.setTermoUrl(urlFinal); // O campo que você já tem na entidade Comodato!
            repository.save(comodato);
        }
            // 3. Salva os dados no banco de dados (SQL)
            Termo termo = new Termo();
            termo.setTipoTermo(tipo);
            termo.setReferenciaId(referenciaisId.get(0));
            termo.setDataCriacao(LocalDate.now());
            termo.setUrlPdf(urlFinal);
            termo.setObservacao(contexto.observacao());

            Termo salvo = termoRepository.save(termo);
            
            return new TermoComBytes(salvo, pdfBytes);

        } catch (IOException e) {
            throw new RuntimeException("Erro ao processar upload do termo", e);
        }
    }

    public record TermoComBytes(
        Termo termo, 
        byte[] bytes) {}
    
}
