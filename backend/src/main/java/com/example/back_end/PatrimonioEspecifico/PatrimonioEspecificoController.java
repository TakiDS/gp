package com.example.back_end.PatrimonioEspecifico;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.back_end.PatrimonioEspecifico.Etiqueta.EtiquetaDto;
import com.example.back_end.PatrimonioGeral.PatGerUpdatePatEsp;
import com.example.back_end.PatrimonioGeral.PatrimonioGeral;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/patrimonio-especifico")
public class PatrimonioEspecificoController {

    private final PatrimonioEspecificoService servico;

    public PatrimonioEspecificoController(PatrimonioEspecificoService servico) {
        this.servico = servico;
    }

    //cadastrar patrimonio
    @PostMapping
    public ResponseEntity<PatrimonioEspecificoDto> cadastrar(@RequestBody @Valid PatrimonioEspecifico objeto) {
        PatrimonioEspecificoDto registro = servico.criar(objeto);
        return ResponseEntity.status(HttpStatus.CREATED).body(registro);
    }

    //consulta por termo busca
    @GetMapping
    public ResponseEntity<Page<PatrimonioEspecificoResponse>> filtro(
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) EstadoEnum estado,
            @RequestParam(required = false) String local,
            @RequestParam(required = false) String termoBusca,
            @RequestParam(required = false) Boolean possuiNota, // <-- Mudou para Boolean
            Pageable paginacao
    ) {
        Page<PatrimonioEspecificoResponse> registros = servico.consultarPorFiltros(
                categoria, estado, local, termoBusca, possuiNota, paginacao
        );

        if (registros.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(registros);
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<PatrimonioEspecificoResponse> consultarPorUuid(@PathVariable UUID uuid) {
        PatrimonioEspecificoResponse registros = servico.consultarPorUuid(uuid);

        return ResponseEntity.status(HttpStatus.OK).body(registros);
    }

    //salvar url no patrimonio x
    @PostMapping("/{uuid}/etiqueta")
    public ResponseEntity<EtiquetaDto> gerarEtiqueta(@PathVariable UUID uuid) {
        return ResponseEntity.ok(servico.gerarESalvarEtiqueta(uuid));
    }

    @GetMapping("/{uuid}/etiqueta")
    public ResponseEntity<byte[]> baixarEtiqueta(
            @PathVariable UUID uuid,
            @RequestParam(defaultValue = "inline") String mode,
            @RequestParam(defaultValue = "light") String tema
        ) {

        boolean isBranca = tema.equalsIgnoreCase("dark");
        byte[] pdf = servico.baixarEtiqueta(uuid, isBranca);

        if(pdf == null || pdf.length == 0) {
            return ResponseEntity.notFound().build();
        }

        String filename = "etiqueta-" + tema + "-" + uuid + ".pdf";
        String disposition = mode.equalsIgnoreCase("download") 
                ? "attachment; filename=\"" + filename + "\"" 
                : "inline; filename=\"" + filename + "\"";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .body(pdf);
    }


    @GetMapping("/etiquetas")
    public ResponseEntity<List<String>> getEtiquetas() {
        return ResponseEntity.ok(servico.retornarEtiquetas());
    }

    
    @PatchMapping("/{uuid}")
    public ResponseEntity<UpdateResponse> atualizar(
            @PathVariable UUID uuid,
            @RequestBody UpdateResponse request) {

        PatrimonioEspecifico atualizado = servico.atualizar(uuid, request);

        PatrimonioGeral geral = atualizado.getPatrimonioGeral();

        PatGerUpdatePatEsp patGe = null;

        if (geral != null) {
            patGe = new PatGerUpdatePatEsp(
                    geral.getUuid(),
                    geral.getDescricao(),
                    geral.getDataAquisicao(),
                    geral.getValorAquisicao(),
                    geral.getCategoria() != null
                            ? geral.getCategoria().getUuid()
                            : null,
                    geral.getNotaFiscal() != null
                            ? geral.getNotaFiscal().getUuid()
                            : null
            );
        }

        UpdateResponse update = new UpdateResponse(
                atualizado.getUuid(),
                atualizado.getNumSerie(),
                atualizado.getEstado(),
                patGe,
                request.observacao(),
                request.contexto()
        );

        return ResponseEntity.ok(update);
    }

    // @PatchMapping("/{uuid}/apagado")
    // public ResponseEntity<ApagadoResponse> setarApagado(
    //     @PathVariable UUID uuid,
    //     @RequestBody ApagadoResponse objeto
    // ) {
    //     PatrimonioEspecifico patrimonio = servico.setarApagado(uuid, objeto);

    //     ApagadoResponse response = new ApagadoResponse(
    //             patrimonio.getUuid(),
    //             patrimonio.getEstado(),
    //             objeto.observacao() != null && !objeto.observacao().isBlank()
    //                     ? objeto.observacao()
    //                     : "Sem observações."
    //     );

    //     return ResponseEntity.ok(response);
    // }


    @PatchMapping
    public ResponseEntity<Void> localMove(@RequestBody BulkMovementDTO dto) {
        servico.movimentarVariosLocal(dto);
        return ResponseEntity.ok().build();
    }


    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> deletar(@PathVariable UUID uuid, @RequestBody ApagadoResponse objeto) {
        servico.deletar(uuid, objeto);
        return ResponseEntity.status(HttpStatus.OK).build();
    }
     
    
}
