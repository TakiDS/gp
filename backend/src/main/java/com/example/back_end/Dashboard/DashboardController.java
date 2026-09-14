package com.example.back_end.Dashboard;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.back_end.PatrimonioEspecifico.EstadoEnum;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService service;

    @GetMapping
    public ResponseEntity<DashboardDTO> buscarResumo() {
        return ResponseEntity.ok(service.getResumo());
    }

    @GetMapping("/grafico-categorias")
    public ResponseEntity<DashboardGraficoResponse> getGrafico() {
        return ResponseEntity.ok(service.getDadosGrafico());
    }

    @GetMapping("/graficos-gerais")
    public ResponseEntity<DashboardGraficosDTO> getDadosGraficosGerais() {
        return ResponseEntity.ok(service.getDadosGraficos());
    }

    // @GetMapping("/cards")
    // public ResponseEntity<DashboardScreenDTO> getDadosCards() {
    //     return ResponseEntity.ok(service.getDados());
    // }

    @GetMapping("/completo")
    public ResponseEntity<DashboardCompletoDTO> getDashboardCompleto(
            @RequestParam(required = false) UUID localUuid,
            @RequestParam(required = false) EstadoEnum status, 
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
             
    ) {
        
        DashboardCompletoDTO dashboard = service.getDashboardCompleto(localUuid,status, dataInicio, dataFim);
        return ResponseEntity.ok(dashboard);
    }
}
