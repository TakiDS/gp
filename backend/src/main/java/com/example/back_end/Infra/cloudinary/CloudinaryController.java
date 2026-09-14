package com.example.back_end.Infra.cloudinary;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/images")
public class CloudinaryController {
    
    private final CloudinaryService cloudinaryService;

    public CloudinaryController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadGenerico(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = cloudinaryService.upload(file);
            return ResponseEntity.ok(result);
        } catch (IOException | RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/upload/imagem")
    public ResponseEntity<Map<String, Object>> uploadImagem(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = cloudinaryService.uploadImagem(file);
            return ResponseEntity.ok(result);
        } catch (IOException | RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/upload/doc")
    public ResponseEntity<Map<String, Object>> uploadDocumento(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = cloudinaryService.uploadNotaFiscal(file);
            return ResponseEntity.ok(result);
        } catch (IOException | RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    
}