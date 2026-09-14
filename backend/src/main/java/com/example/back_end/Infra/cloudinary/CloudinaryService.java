package com.example.back_end.Infra.cloudinary;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class CloudinaryService {
    private final Cloudinary cloudinary;

    private static final List<String> TIPOS_IMAGEM = Arrays.asList("image/jpeg", "image/png", "image/webp", "image/jpg");
    private static final List<String> TIPOS_DOC = Arrays.asList("application/pdf", "text/xml", "application/xml");

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public Map<String, Object> upload(MultipartFile file) throws IOException {
        return uploadNotaFiscal(file);
    }

    public Map<String, Object> uploadNotaFiscal(MultipartFile file) throws IOException {
        validarArquivo(file, TIPOS_DOC, "Apenas PDF ou XML são permitidos na Nota Fiscal.");
        return subirParaCloudinary(file, "auto");
    }

    public Map<String, Object> uploadImagem(MultipartFile file) throws IOException {
        validarArquivo(file, TIPOS_IMAGEM, "Apenas imagens (JPG, PNG) são permitidas.");
        return subirParaCloudinary(file, "image");
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> uploadBytes(byte[] fileBytes) throws IOException {
        return (Map<String, Object>) cloudinary.uploader().upload(fileBytes,
                ObjectUtils.asMap(
                        "resource_type", "auto",
                        "public_id", "NF-" + UUID.randomUUID().toString()));
    }

    private void validarArquivo(MultipartFile file, List<String> tipos, String erro) {
        if (!tipos.contains(file.getContentType())) {
            throw new RuntimeException("Arquivo inválido! " + erro);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> subirParaCloudinary(MultipartFile file, String tipoRecurso) throws IOException {
        return (Map<String, Object>) cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", tipoRecurso,
                        "public_id", UUID.randomUUID().toString()));
    }

    //upload da etiqueta
    @SuppressWarnings("unchecked")
    public Map<String, Object> uploadEtiqueta(byte[] fileBytes, String identificador) throws IOException {
        return (Map<String, Object>) cloudinary.uploader().upload(
            fileBytes,
            ObjectUtils.asMap(
                "resource_type", "image",
                "public_id", "etiqueta/" + identificador,
                "format", "pdf",
                "overwrite", true
            )
        );
    }

    public byte[] downloadEtiqueta(String identificador) {
        try {
            // Recupera informações do recurso no Cloudinary
            @SuppressWarnings("unchecked")
            Map<String, Object> res = (Map<String, Object>) cloudinary.api()
                    .resource("etiqueta/" + identificador, ObjectUtils.emptyMap());

            String url = (String) res.get("url");

            if (url == null || url.isBlank()) {
                throw new IllegalStateException("Etiqueta não encontrada no Cloudinary para o UUID: " + identificador);
            }

            // Baixa o conteúdo da URL
            try (InputStream in = new URL(url).openStream()) {
                return in.readAllBytes();
            }

        } catch (IOException e) {
            throw new RuntimeException("Erro ao baixar etiqueta do Cloudinary: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao acessar recurso da etiqueta: " + e.getMessage(), e);
        }
    }

    //urlEtiqueta
    public String gerarUrlEtiqueta(String identificador) {

        return cloudinary.url()
                .resourceType("image")
                .format("pdf")
                .generate("etiqueta/" + identificador);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> uploadTermoPdf(byte[] fileBytes, String publicId) throws IOException {
        return (Map<String, Object>) cloudinary.uploader().upload(fileBytes,
                ObjectUtils.asMap(
                        "resource_type", "auto",
                        "folder", "termos_comodato",
                        "public_id", publicId,
                        "format", "pdf"
                ));
    }
}