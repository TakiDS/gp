package com.example.back_end.NfeConsulta;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.swconsultoria.certificado.CertificadoService;
import com.example.back_end.Infra.seguranca.service.SensitiveDataCryptoService;

@RestController
@RequestMapping("/certificados")
public class CertificadoController {

    private final CertificadoDigitalRepository certificadoRepository;
    private final SensitiveDataCryptoService cryptoService;

    public CertificadoController(
            CertificadoDigitalRepository certificadoRepository,
            SensitiveDataCryptoService cryptoService) {
        this.certificadoRepository = certificadoRepository;
        this.cryptoService = cryptoService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> salvarOuAtualizarCertificado(
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam("senha") String senha) {

        try {
            if (arquivo.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erro: O arquivo está vazio.");
            }
            if (senha == null || senha.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erro: A senha é obrigatória.");
            }

            //Verificar se realmente a senha
            try {
                // Tenta carregar o certificado em memória usando os bytes e a senha informada
                CertificadoService.certificadoPfxBytes(arquivo.getBytes(), senha);
            } catch (Exception e) {
                // Se o Java cair aqui dentro, significa que a senha não "destrancou" o arquivo PFX
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Erro: A senha informada está incorreta ou o arquivo não é um certificado PFX válido!");
            }

            // 1. Busca o primeiro certificado que existir no banco. Se a tabela estiver vazia, cria um novo.
            CertificadoDigital cert = certificadoRepository.findAll().stream()
                    .findFirst()
                    .orElse(new CertificadoDigital());

            // 2. Atualiza os dados (sem forçar o ID manualmente)
            cert.setArquivoPfx(cryptoService.encrypt(arquivo.getBytes()));
            cert.setSenha(cryptoService.encryptString(senha));

            // 3. Salva no banco. Se era novo (ID nulo), ele faz INSERT. Se já existia, faz UPDATE.
            certificadoRepository.save(cert);

            return ResponseEntity.ok("Certificado atualizado com sucesso! O sistema já está usando o novo arquivo.");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro interno ao salvar o certificado.");
        }
    }
}
