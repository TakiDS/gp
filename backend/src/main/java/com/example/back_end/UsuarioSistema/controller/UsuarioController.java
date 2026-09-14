package com.example.back_end.UsuarioSistema.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.back_end.UsuarioSistema.domain.UsuarioRole;
import com.example.back_end.UsuarioSistema.domain.UsuarioSistema;

import com.example.back_end.UsuarioSistema.dto.AtualizarUsuarioDto;
import com.example.back_end.UsuarioSistema.dto.ConviteDto;
import com.example.back_end.UsuarioSistema.dto.RoleUpdate;
import com.example.back_end.UsuarioSistema.dto.TrocaSenhaLogadoDto;
import com.example.back_end.UsuarioSistema.dto.UsuarioDTO;
import com.example.back_end.UsuarioSistema.mapper.UsuarioMapperr;
import com.example.back_end.UsuarioSistema.service.UsuarioService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final UsuarioMapperr mapper;

    public UsuarioController(UsuarioService usuarioService, UsuarioMapperr mapper) {
        this.usuarioService = usuarioService;
        this.mapper = mapper;
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioDTO> getMe() {
        UsuarioSistema usuario = usuarioService.buscarUsuarioLogado();
        return ResponseEntity.ok(new UsuarioDTO(usuario));
    }

    // @PutMapping("/me")
    // public ResponseEntity<UsuarioDTO> updateMe(@RequestBody @Valid AtualizarPerfilDto dados) {
    //     UsuarioSistema atualizado = usuarioService.atualizarPerfil(dados);
    //     return ResponseEntity.ok(new UsuarioDTO(atualizado));
    // }

    @PostMapping("/me/alterar-senha")
    public ResponseEntity<Void> changePassword(@RequestBody @Valid TrocaSenhaLogadoDto dados) {
        usuarioService.trocarSenhaLogado(dados.senhaAtual(), dados.novaSenha());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Page<UsuarioDTO>> listarTodos(Pageable paginacao) {
        Page<UsuarioDTO> lista = usuarioService.listarTodos(paginacao);
        return ResponseEntity.ok(lista);
    }

     //consultar (ok)
    @GetMapping("/consultar")
    public ResponseEntity<Page<UsuarioDTO>> consultar(
        @RequestParam (required = false) String termoBusca, Pageable paginacao
    ) {
        Page<UsuarioSistema> registros = usuarioService.consultar(termoBusca, paginacao);

        if(registros.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        Page<UsuarioDTO> dtos = registros.map(mapper::toDtoo);

        return ResponseEntity.status(HttpStatus.OK).body(dtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<UsuarioDTO> buscarPorId(@PathVariable UUID id) {
        UsuarioSistema usuario = usuarioService.buscarPorId(id);
        return ResponseEntity.ok(new UsuarioDTO(usuario));
    }

    @PostMapping("/convidar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioDTO> convidar(@RequestBody @Valid ConviteDto dados) {
        UsuarioSistema novoUsuario = usuarioService.convidarUsuario(dados);
        return ResponseEntity.ok(new UsuarioDTO(novoUsuario));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioDTO> atualizarUsuario(@PathVariable UUID id, @RequestBody AtualizarUsuarioDto dados) {
        UsuarioSistema atualizado = usuarioService.atualizarUsuarioAdmin(id, dados);
        return ResponseEntity.ok(new UsuarioDTO(atualizado));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        usuarioService.excluirUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> alterarRole(@PathVariable UUID id, @RequestBody RoleUpdate role, HttpServletResponse response) {
        UsuarioSistema logadoAntes = usuarioService.buscarUsuarioLogado();
        UsuarioSistema sucessor = usuarioService.alterarPermissao(id, role.role());
        
        // Se a alteração foi para dar o cargo de ADMIN a outro...
        if (role.role() == UsuarioRole.ADMIN) {
            // LIMPA O MEU COOKIE: O navegador vai receber isso e apagar o token
            Cookie cookie = new Cookie("refreshToken", null);
            cookie.setHttpOnly(true);
            cookie.setPath("/");
            cookie.setMaxAge(0); // "Morra agora"
            response.addCookie(cookie);

            // Retorna um sinal claro para o meu Front-end me jogar na tela de login
            return ResponseEntity.ok(Map.of(
                "message", "Você passou o cargo de ADMIN. Sua sessão foi encerrada.",
                "logoutImediato", true
            ));
        }
        return ResponseEntity.ok(new UsuarioDTO(sucessor));
    }
}