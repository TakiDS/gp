package com.example.back_end.PatrimonioEspecifico;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public/patrimonio")
public class PatrimonioPublicoController {

    private final PatrimonioEspecificoService servico;

    public PatrimonioPublicoController(PatrimonioEspecificoService servico) {
        this.servico = servico;
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<PatrimonioPublicoDTO> consultarPatrimonioPublico(@PathVariable UUID uuid) {
        PatrimonioPublicoDTO registro = servico.consultarPublicoPorUuid(uuid);
        return ResponseEntity.ok(registro);
    }
}