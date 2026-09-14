package com.example.back_end.UsuarioSistema.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HexFormat;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.back_end.Infra.email.EmailService;
import com.example.back_end.Infra.excecoes.BusinessException;
import com.example.back_end.UsuarioSistema.domain.StatusUsuario;
import com.example.back_end.UsuarioSistema.domain.UsuarioRole;
import com.example.back_end.UsuarioSistema.domain.UsuarioSistema;
import com.example.back_end.UsuarioSistema.dto.AtualizarUsuarioDto;
import com.example.back_end.UsuarioSistema.dto.CadastroDto;
import com.example.back_end.UsuarioSistema.dto.ConviteDto;
import com.example.back_end.UsuarioSistema.dto.UsuarioDTO;
import com.example.back_end.UsuarioSistema.repository.UsuarioSistemaRepository;

import jakarta.persistence.EntityNotFoundException;


@Service
public class UsuarioService {

    private final UsuarioSistemaRepository repository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioSistemaRepository repository, EmailService emailService, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<UsuarioDTO> listarTodos(Pageable paginacao) {
        return repository.findAll(paginacao).map(UsuarioDTO::new);
    }

    @Transactional
    public Page<UsuarioSistema> consultar(String termoBusca, Pageable paginacao) {
        if(termoBusca != null && !termoBusca.isBlank()) {
            return repository.consultar(termoBusca, paginacao);
        }
        return repository.findAll(paginacao);
    }

    public UsuarioSistema buscarPorId(UUID uuid){
        return repository.findById(uuid).orElseThrow(
            () -> new EntityNotFoundException("Usuario não encontrado: " + uuid));
    }

    public UsuarioSistema buscarUsuarioLogado() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String login = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();
        UsuarioSistema usuario = repository.findByLogin(login).orElseThrow(
            ()-> new RuntimeException("Usuario não encontrado.")
        );
        

        return usuario;
    }

    @Transactional
    public UsuarioSistema convidarUsuario(ConviteDto dados) {
        if (repository.findByLogin(dados.email()).isPresent()) {
            throw new RuntimeException("E-mail já cadastrado!");
        }

        String senhaDummy = UUID.randomUUID().toString();
        
        UsuarioSistema novoUsuario = new UsuarioSistema(dados.email(), passwordEncoder.encode(senhaDummy), dados.nome(), UsuarioRole.USER);
        novoUsuario.setStatus(StatusUsuario.PENDENTE);

        String token = UUID.randomUUID().toString();
        novoUsuario.setCodigoRecuperacao(hashToken(token));

        LocalDateTime expiração = LocalDateTime.now(ZoneId.of("America/Rio_Branco")).plusHours(48);
        novoUsuario.setDataExpiracaoCodigo(expiração);
        repository.save(novoUsuario);
        emailService.enviarEmailConvite(dados.email(), token);
        return novoUsuario;
    }

    @Transactional
    public UsuarioSistema alterarPermissao(UUID idSucessor, UsuarioRole novaRole) {
        UsuarioSistema euAdmin = buscarUsuarioLogado();
        UsuarioSistema sucessor = buscarPorId(idSucessor);

        if(sucessor.getStatus() == StatusUsuario.PENDENTE) {
            throw new IllegalStateException("Não é possível tornar ADMIN um usuário com status PENDENTE.");
        }

        if (novaRole == UsuarioRole.ADMIN) {
            euAdmin.setRole(UsuarioRole.USER); 
            repository.save(euAdmin);

            sucessor.setRole(UsuarioRole.ADMIN);
            repository.save(sucessor);

        }

        return sucessor;
    }

    @Transactional
    public void excluirUsuario(UUID id) {
        UsuarioSistema usuario = buscarPorId(id);
        if (usuario.getRole() == UsuarioRole.ADMIN) {
            throw new RuntimeException("Não é possível excluir um administrador.");
        }
        if (usuario.getStatus() == StatusUsuario.ATIVO) {
            throw new IllegalStateException("Não é possível excluir usuario ATIVO!");
        }
        repository.deleteById(id);
    }

    @Transactional //COMENTARIOS
    public UsuarioSistema atualizarUsuarioAdmin(UUID uuid, AtualizarUsuarioDto dados) {
        UsuarioSistema usuario = buscarPorId(uuid);
         if (dados.nome() != null) {

            if (dados.nome().isBlank()) {
                throw new IllegalStateException("O nome não pode estar vazio.");
            }

            if (dados.nome().length() < 3) {
                throw new IllegalStateException("O nome deve ter pelo menos 3 caracteres.");
            }

            usuario.setNome(dados.nome());
        }
        
        if (dados.status() != null) {

            if(usuario.getStatus() == StatusUsuario.PENDENTE) {
                throw new IllegalStateException("Não é possível ATIVAR/INATIVAR usuário com status PENDENTE.");
            }

            if (dados.status() == StatusUsuario.INATIVO && usuario.getRole() == UsuarioRole.ADMIN) {
                throw new IllegalStateException("Não é possível inativar um administrador.");
            }

            usuario.setStatus(dados.status());
        }
        return repository.save(usuario);
    }

    @Transactional
    public void solicitarRecuperacao(String email) {
        repository.findByLogin(email).ifPresent(usuario -> {
            String token = UUID.randomUUID().toString();
            usuario.setCodigoRecuperacao(hashToken(token));
            usuario.setDataExpiracaoCodigo(LocalDateTime.now().plusMinutes(15));
            repository.save(usuario);
            emailService.enviarEmailRecuperacao(usuario.getUsername(), token);
        });
    }

    @Transactional
    public void definirSenhaInicial(String token, String novaSenha, String confirmarSenha) {

        if(!novaSenha.equals(confirmarSenha)) {
            throw new IllegalArgumentException("As senhas não coincidem.");
        }
        UsuarioSistema usuario = repository.findByCodigoRecuperacao(hashToken(token)).orElseThrow(
            ()-> new IllegalArgumentException("Token inválido ou expirado.")
        );
        LocalDateTime hoje = LocalDateTime.now(ZoneId.of("America/Rio_Branco"));

        if (usuario.getDataExpiracaoCodigo().isBefore(hoje)) {
            throw new IllegalArgumentException("Token inválido ou expirado.");
        }

        usuario.setSenha(passwordEncoder.encode(confirmarSenha));
        usuario.setCodigoRecuperacao(null);
        usuario.setDataExpiracaoCodigo(null);
        usuario.setStatus(StatusUsuario.ATIVO);
        repository.save(usuario);
    }

    @Transactional //redefinição de senha
    public void trocarSenhaLogado(String senhaAtual, String novaSenha) {
        UsuarioSistema usuario = buscarUsuarioLogado();
        if (!passwordEncoder.matches(senhaAtual, usuario.getSenha())) throw new RuntimeException("A senha atual está incorreta.");
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        repository.save(usuario);
    }

    @Transactional
    public UsuarioSistema criarUsuarioInterno(CadastroDto dados, UsuarioRole role) {
        if (repository.findByLogin(dados.email()).isPresent()){
            throw new BusinessException("Já existe um usuário com este e-mail.");
        } 
        UsuarioSistema usuario = new UsuarioSistema(dados.email(), passwordEncoder.encode(dados.senha()), dados.nome(), role);
        usuario.setStatus(StatusUsuario.ATIVO);
        return repository.save(usuario);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 não está disponível", e);
        }
    }
}
