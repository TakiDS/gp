package com.example.back_end.PatrimonioGeral;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/patrimonio-geral")
public class PatrimonioGeralController {
    private final PatrimonioGeralService service;
    private final PatrimonioGeralMapper mapper;
   

    public PatrimonioGeralController(PatrimonioGeralService service, PatrimonioGeralMapper mapper){
        this.service = service;
        this.mapper = mapper;
    }

    // LISTAR
    @GetMapping
    public Page<PatrimonioGeralDTO> getAll(Pageable paginacao){
        return service.getAll(paginacao);
                
    }

    // CRIAR
    @PostMapping
    public ResponseEntity<PatrimonioGeralDTO> create(@RequestBody PatrimonioGeralCreateRequest request) {
        // Agora o Service recebe o Request completo, incluindo a quantidade e o local
        PatrimonioGeral salvo = service.gerarPatrimoniosEspecificos(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(salvo));
    }

    // ATUALIZAR
    @PutMapping("/{uuid}")
    public PatrimonioGeralDTO update(@PathVariable UUID uuid, @RequestBody PatrimonioGeralUpdateRequest request) {
        PatrimonioGeral atualizado = service.atualizarPatrimonio(
            uuid, 
            mapper.toEntity(request),
            request.uuid_categoria(),
            request.uuid_notaFiscalId());
        return mapper.toDto(atualizado);
    }

    @PatchMapping
    public ResponseEntity<Void> categoMove(@RequestBody CategoriaMovementDTO dto) {
        service.movimentarVariosCategoria(dto);
        return ResponseEntity.ok().build();
    }

    // DELETAR
    @DeleteMapping("/{uuid}")
    public void delete(@PathVariable UUID uuid){
        service.delete(uuid);
    }
}