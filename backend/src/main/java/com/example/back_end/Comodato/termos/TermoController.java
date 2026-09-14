package com.example.back_end.Comodato.termos;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/termos")
public class TermoController {

    private final TermoService termoService;

    public TermoController(TermoService termoService) {
        this.termoService = termoService;
    }

    @PostMapping("/gerar")
    public ResponseEntity<Termo> criarTermo(
            @RequestParam TipoTermoEnum tipo,
            @RequestParam List<UUID> referenciaIds,
            @RequestParam (required = false) ContextoTermo contexto
        
        ) {
        
        var resultado = termoService.gerarSalvarEUpload(tipo, referenciaIds, contexto);

        return ResponseEntity.ok(resultado.termo());
    }
}
