package com.example.back_end.NotaFiscal;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/notafiscal") // Mantido conforme o Front espera
public class NotaFiscalController {

    private final NotaFiscalService service;
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(NotaFiscalController.class);

    public NotaFiscalController(NotaFiscalService service) {
        this.service = service;
    }

    // @GetMapping
    // public Page<NotaFiscalDTO> getAll(Pageable paginacao) {
    //     return service.getAll(paginacao)
    //             .map(NotaFiscalMapper::toDTO);
    // }

    @GetMapping
    public ResponseEntity<Page<NotaFiscalDTO>> filtrarNotasFiscais(
            @RequestParam(required = false) String termoBusca,
            @RequestParam(required = false) StatusNota status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            Pageable paginacao
    ) {
        Page<NotaFiscalDTO> registros = service.consultarPorFiltros(termoBusca, status, dataInicio, dataFim, paginacao);

        if (registros.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(registros);
    }

    @GetMapping("/{uuid}")
    public NotaFiscalDTOComListaDePatrimonios getOne(@PathVariable UUID uuid) {
        NotaFiscal achada = service.buscaId(uuid);
        return NotaFiscalDetalhadaMapper.toDetalheDTO(achada);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> create( // Mudamos para <?> para aceitar o Map de erro
            @RequestParam("file") MultipartFile file,
            @RequestParam("categoriaUuid") UUID categoriaUuid,
            @RequestParam("localizacaoUuid") UUID localizacaoUuid) {
        try {
            NotaFiscal salvo = service.createWithUpload(file, categoriaUuid, localizacaoUuid);
            return ResponseEntity.ok(NotaFiscalMapper.toDTO(salvo));
        } catch (Exception e) {
            log.error("Erro ao processar nota: {}", e.getMessage());

            // Verificamos se a mensagem é de duplicidade para mandar o status 409 (Conflict)
            if (e.getMessage().contains("já está cadastrada")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", e.getMessage()));
            }

            // Para outros erros, mandamos 500 com a mensagem no corpo
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erro interno: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/nota-sem-patrimonio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createManual( // Mudamos para <?> aqui também
            @RequestParam("file") MultipartFile file,
            @RequestParam("fornecedor") String fornecedor,
            @RequestParam("cnpj") String cnpj,
            @RequestParam("valorTotal") BigDecimal valorTotal,
            @RequestParam("dataEmissao") String dataEmissao,
            @RequestParam("quantidade") Integer quantidade) {
        try {
            NotaFiscalManualRequest request = new NotaFiscalManualRequest(
                    fornecedor, cnpj, valorTotal, LocalDate.parse(dataEmissao), quantidade, null);

            NotaFiscal salvo = service.createManualWithUpload(file, request);
            return ResponseEntity.ok(NotaFiscalMapper.toDTO(salvo));
        } catch (Exception e) {
            log.error("Erro no upload manual: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{uuid}")
    public NotaFiscalDTO update(@PathVariable UUID uuid, @RequestBody NotaFiscalUpdateRequest request) {
        NotaFiscal updated = service.atualizarNotaFiscal(uuid, request);
        return NotaFiscalMapper.toDTO(updated);
    }

    @DeleteMapping("/{uuid}")
    public void delete(@PathVariable UUID uuid) {
        service.delete(uuid);
    }
}
