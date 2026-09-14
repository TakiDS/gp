package com.example.back_end.Categoria;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/categoria")
public class CategoriaController {
    private final CategoriaService service;
    private final CategoriaMapper mapper;

    public CategoriaController(CategoriaService service, CategoriaMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    // CRIAR
    @PostMapping
    public CategoriaDTO cadastrar(@RequestBody @Valid CategoriaDTO dto) {
        Categoria categoriaEntity = mapper.toEntityy(dto);
        Categoria categoria = service.save(categoriaEntity);

        return mapper.toDto(categoria);
    }

    // Consultar
    @GetMapping 
    public ResponseEntity<Page<CategoriaResponseDto>> consultar(@RequestParam(required = false) String termoBusca, Pageable paginacao) {

        Page<Categoria> categorias = service.consultar(termoBusca, paginacao);

        Page<CategoriaResponseDto> registros = categorias.map(cat -> { 
            int totalPatrimonio = service.contarPatrimonioPorCategoria(cat.getUuid());

            return new CategoriaResponseDto(
                    cat.getUuid(),
                    cat.getNome(),
                    cat.getDescricao(),
                    totalPatrimonio
            );
        });

        return ResponseEntity.ok(registros);
    }


    //Consultar por UUID
    @GetMapping("/{uuid}")
    public ResponseEntity<CategoriaResponsePatDto> consultarPorUuid(
            @PathVariable UUID uuid, 
            @RequestParam(required = false) String termoBusca, 
            Pageable paginacao) {

        // Trata o termo para não passar string vazia
        String termo = (termoBusca == null || termoBusca.isBlank()) ? null : termoBusca;
        
        CategoriaResponsePatDto response = service.consultarPorUuid(uuid, termo, paginacao);

        return ResponseEntity.ok(response);
    }

    

    // ATUALIZAR
    @PutMapping("/{uuid}")
    public ResponseEntity<CategoriaDTO> atualizar(@PathVariable UUID uuid, @RequestBody @Valid CategoriaResponseDto dto) {
        Categoria categoriaEntity = mapper.toEntity(dto);
        Categoria updated = service.atualizarCategoria(uuid, categoriaEntity);
        CategoriaDTO atualizado = mapper.toDto(updated);
        return ResponseEntity.status(HttpStatus.OK).body(atualizado);
    }

    // DELETAR
    @DeleteMapping("/{uuid}")
    public void deletar(@PathVariable UUID uuid) {
        service.deletar(uuid);
    }
}