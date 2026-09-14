package com.example.back_end.Infra.seguranca.service;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SensitiveDataCryptoService {

    private static final byte[] MAGIC = "GIAP1".getBytes(StandardCharsets.US_ASCII);
    private static final int NONCE_LENGTH = 12;
    private static final int TAG_LENGTH_BITS = 128;
    private static final String STRING_PREFIX = "v1:";

    private final SecretKeySpec key;
    private final SecureRandom secureRandom = new SecureRandom();

    public SensitiveDataCryptoService(@Value("${app.data-encryption-key}") String base64Key) {
        try {
            byte[] decodedKey = Base64.getDecoder().decode(base64Key);
            if (decodedKey.length != 32) {
                throw new IllegalArgumentException("A chave deve ter exatamente 32 bytes.");
            }
            this.key = new SecretKeySpec(decodedKey, "AES");
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException(
                    "DATA_ENCRYPTION_KEY_BASE64 deve ser uma chave AES de 32 bytes codificada em Base64.", e);
        }
    }

    public byte[] encrypt(byte[] plaintext) {
        try {
            byte[] nonce = new byte[NONCE_LENGTH];
            secureRandom.nextBytes(nonce);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BITS, nonce));
            byte[] encrypted = cipher.doFinal(plaintext);

            return ByteBuffer.allocate(MAGIC.length + nonce.length + encrypted.length)
                    .put(MAGIC)
                    .put(nonce)
                    .put(encrypted)
                    .array();
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Falha ao criptografar dado sensível.", e);
        }
    }

    public byte[] decrypt(byte[] ciphertext) {
        if (ciphertext == null || ciphertext.length <= MAGIC.length + NONCE_LENGTH
                || !MessageDigest.isEqual(MAGIC, Arrays.copyOf(ciphertext, MAGIC.length))) {
            throw new IllegalStateException(
                    "Dado sensível legado ou inválido. Reenvie o certificado para criptografá-lo.");
        }

        try {
            ByteBuffer buffer = ByteBuffer.wrap(ciphertext);
            buffer.position(MAGIC.length);
            byte[] nonce = new byte[NONCE_LENGTH];
            buffer.get(nonce);
            byte[] encrypted = new byte[buffer.remaining()];
            buffer.get(encrypted);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BITS, nonce));
            return cipher.doFinal(encrypted);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Falha ao descriptografar dado sensível.", e);
        }
    }

    public String encryptString(String plaintext) {
        return STRING_PREFIX + Base64.getEncoder().encodeToString(encrypt(plaintext.getBytes(StandardCharsets.UTF_8)));
    }

    public String decryptString(String ciphertext) {
        if (ciphertext == null || !ciphertext.startsWith(STRING_PREFIX)) {
            throw new IllegalStateException(
                    "Senha de certificado legada ou inválida. Reenvie o certificado para criptografá-la.");
        }
        try {
            byte[] encrypted = Base64.getDecoder().decode(ciphertext.substring(STRING_PREFIX.length()));
            return new String(decrypt(encrypted), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("Senha de certificado criptografada inválida.", e);
        }
    }
}
