package com.example.back_end.Infra.seguranca.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.example.back_end.UsuarioSistema.domain.UsuarioSistema;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    @Value("${api.security.token.expiration-minutes:180}")
    private int expirationMinutes;

    public String gerarToken(UsuarioSistema usuario) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("auth-api")
                    .withSubject(usuario.getLogin())
                    .withClaim("id", usuario.getUuid().toString())
                    .withClaim("role", usuario.getRole().name()) 
                    .withExpiresAt(genExpirationDate(expirationMinutes, ChronoUnit.MINUTES))
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar token JWT", exception);
        }
    }

    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer("auth-api")
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException exception) {
            return "";
        }
    }

    // Refatorado para aceitar diferentes tempos
    private Instant genExpirationDate(int amount, ChronoUnit unit) {
        return Instant.now().plus(amount, unit);
    }

    // Sobrecarga para manter compatibilidade com o método antigo se necessário
    private Instant genExpirationDate() {
        return genExpirationDate(expirationMinutes, ChronoUnit.MINUTES);
    }
}