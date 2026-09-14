package com.example.back_end.PatrimonioEspecifico.Etiqueta;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/etiqueta")
public class EtiquetaController {

    private final EtiquetaService servico;

    public EtiquetaController(EtiquetaService servico) {
        this.servico = servico;
    }

    //fazer o download
    @GetMapping("/{uuidPatrimonio}")
    public ResponseEntity<byte[]> retornoEtiqueta(
            @PathVariable UUID uuidPatrimonio,
            @RequestParam(defaultValue = "inline") String mode,
            @RequestParam(defaultValue = "light") String tema
    ) {
        try {
            boolean isBranco = tema.equalsIgnoreCase("dark");

            byte[] pdf = servico.retornoEtiqueta(uuidPatrimonio, isBranco);

            if (pdf == null || pdf.length == 0) {
                return ResponseEntity.notFound().build(); // não encontrou a etiqueta
            }

            String filename = "etiqueta-" + tema + "-" + uuidPatrimonio + ".pdf";
            String disposition = mode.equalsIgnoreCase("download")
                    ? "attachment; filename=\"" + filename + "\""
                    : "inline; filename=\"" + filename + "\"";

            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, disposition)
                    .body(pdf);

        } catch (IllegalStateException e) {
            // Etiqueta ainda não gerada
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage().getBytes());
        } catch (Exception e) {
            // Qualquer outro erro (ex: Cloudinary)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Erro ao baixar etiqueta: " + e.getMessage()).getBytes());
        }
    }
    
    
}
