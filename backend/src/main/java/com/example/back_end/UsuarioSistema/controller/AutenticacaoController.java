package com.example.back_end.UsuarioSistema.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.back_end.Infra.seguranca.dto.AutenticacaoDto;
import com.example.back_end.Infra.seguranca.dto.LoginResponseDto;
import com.example.back_end.Infra.seguranca.dto.RecuperacaoRequestDto;
import com.example.back_end.Infra.seguranca.service.TokenService;
import com.example.back_end.UsuarioSistema.domain.UsuarioRole;
import com.example.back_end.UsuarioSistema.domain.UsuarioSistema;
import com.example.back_end.UsuarioSistema.dto.CadastroDto;
import com.example.back_end.UsuarioSistema.dto.DefinirSenhaDto;
import com.example.back_end.UsuarioSistema.service.UsuarioService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AutenticacaoController {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final UsuarioService usuarioService;

    public AutenticacaoController(AuthenticationManager authenticationManager,
            TokenService tokenService,
            UsuarioService usuarioService
        ) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody @Valid AutenticacaoDto data, HttpServletResponse response){
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.login(), data.senha());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        var usuario = (UsuarioSistema) auth.getPrincipal();
        
        var token = tokenService.gerarToken(usuario);

        return ResponseEntity.ok(new LoginResponseDto(token, usuario.getNome(), usuario.getLogin(), usuario.getRole().toString()));
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> register(@RequestBody @Valid CadastroDto data){
        usuarioService.criarUsuarioInterno(data, data.role() != null ? data.role() : UsuarioRole.USER);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/definir-senha")
    public ResponseEntity<Map<String, String>> definirSenha(@RequestBody @Valid DefinirSenhaDto dados) {
        usuarioService.definirSenhaInicial(dados.token(), dados.novaSenha(), dados.confirmarSenha());
        return ResponseEntity.ok(Map.of("message", "Senha definida com sucesso! Você já pode fazer login."));
       
    }

    @PostMapping("/recuperar-senha")
    public ResponseEntity<Map<String, String>> solicitarRecuperacao(@RequestBody @Valid RecuperacaoRequestDto dados) {
        usuarioService.solicitarRecuperacao(dados.email());
        return ResponseEntity.ok(Map.of(
                "message", "Se o e-mail estiver cadastrado, as instruções de recuperação serão enviadas."));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {

        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        // cookie.setSecure(false); // true em produção
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ResponseEntity.ok("Sessão encerrada.");
    }
    
    
}
