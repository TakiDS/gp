package com.example.back_end.Historico.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.back_end.Historico.dto.HistoricoDto;
import com.example.back_end.Historico.service.HistoricoService;

import java.util.List;

@RestController
@RequestMapping("/historico")
public class HistoricoController {

    private final HistoricoService service;

    public HistoricoController(HistoricoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<HistoricoDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
}