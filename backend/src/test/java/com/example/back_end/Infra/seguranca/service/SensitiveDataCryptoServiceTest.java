package com.example.back_end.Infra.seguranca.service;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.junit.jupiter.api.Test;

class SensitiveDataCryptoServiceTest {

    private final SensitiveDataCryptoService service = new SensitiveDataCryptoService(
            Base64.getEncoder().encodeToString(new byte[32]));

    @Test
    void encryptsAndDecryptsBytes() {
        byte[] plaintext = "certificado-confidencial".getBytes(StandardCharsets.UTF_8);

        byte[] encrypted = service.encrypt(plaintext);

        assertFalse(java.util.Arrays.equals(plaintext, encrypted));
        assertArrayEquals(plaintext, service.decrypt(encrypted));
    }

    @Test
    void usesANewNonceForEveryEncryption() {
        byte[] plaintext = "mesmo-valor".getBytes(StandardCharsets.UTF_8);

        assertFalse(java.util.Arrays.equals(service.encrypt(plaintext), service.encrypt(plaintext)));
    }

    @Test
    void rejectsLegacyPlaintext() {
        assertThrows(IllegalStateException.class,
                () -> service.decrypt("nao-criptografado".getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    void rejectsInvalidKey() {
        assertThrows(IllegalStateException.class, () -> new SensitiveDataCryptoService("invalida"));
    }
}
