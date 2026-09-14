package com.example.back_end.Titular.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.back_end.Titular.domain.StatusPerfil;
import com.example.back_end.Titular.domain.Titular;
import com.example.back_end.Titular.dto.ComodatoByTitular;
import com.example.back_end.Titular.dto.TitularDto;
import com.example.back_end.Titular.dto.TitularRequestDto;
import com.example.back_end.Titular.dto.TitularUpdate;
import com.example.back_end.Titular.mapper.TitularMapper;
import com.example.back_end.Titular.service.TitularService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/titular")
public class TitularController {

    private final TitularService service;
    private final TitularMapper mapper;

    public TitularController(TitularService service, TitularMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping
    public ResponseEntity<TitularDto> create(@RequestBody @Valid TitularDto dto) {
        Titular entity = mapper.toEntity(dto);
        Titular salvo = service.salvar(entity);
        TitularDto objeto = mapper.toDto(salvo);
        return ResponseEntity.status(HttpStatus.CREATED).body(objeto);
    }

    @GetMapping
    public ResponseEntity<Page<TitularRequestDto>> consultar(@RequestParam(required = false) String termoBusca, @RequestParam(required = false) StatusPerfil statusPerfil, Pageable paginacao) {
        Page<Titular> titulares = service.consultar(termoBusca, statusPerfil, paginacao);

        Page<TitularRequestDto> dto = titulares.map(mapper::toRequestDto);

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ComodatoByTitular> getById(@PathVariable UUID uuid) {
        Titular titular = service.getById(uuid);
        return ResponseEntity.ok(mapper.toComodatoByTitular(titular));
    }

    @PatchMapping("/{uuid}")
    public ResponseEntity<TitularUpdate> update(@PathVariable UUID uuid, @RequestBody @Valid TitularUpdate dto) {
        Titular atualizado = service.update(uuid, dto);
        TitularUpdate salvo = mapper.toDtoo(atualizado);
        return ResponseEntity.ok(salvo);
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> delete(@PathVariable UUID uuid) {
        service.delete(uuid);
        return ResponseEntity.noContent().build();
    }
}