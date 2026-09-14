package com.example.back_end.Infra.seguranca.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.example.back_end.UsuarioSistema.domain.StatusUsuario;
import com.example.back_end.UsuarioSistema.domain.UsuarioRole;
import com.example.back_end.UsuarioSistema.domain.UsuarioSistema;
import com.example.back_end.UsuarioSistema.repository.UsuarioSistemaRepository;

@Configuration
@ConditionalOnProperty(name = "app.bootstrap-admin.enabled", havingValue = "true")
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UsuarioSistemaRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String emailAdmin;
    private final String senhaAdmin;
    private final String nomeAdmin;

    public DataInitializer(
            UsuarioSistemaRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap-admin.email}") String emailAdmin,
            @Value("${app.bootstrap-admin.password}") String senhaAdmin,
            @Value("${app.bootstrap-admin.name:Administrador do Sistema}") String nomeAdmin) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailAdmin = emailAdmin;
        this.senhaAdmin = senhaAdmin;
        this.nomeAdmin = nomeAdmin;
    }

    @Override
    public void run(String... args) throws Exception {
        if (emailAdmin.isBlank() || senhaAdmin.length() < 12) {
            throw new IllegalStateException(
                    "BOOTSTRAP_ADMIN_EMAIL e uma BOOTSTRAP_ADMIN_PASSWORD com ao menos 12 caracteres são obrigatórios quando o bootstrap está habilitado.");
        }

        usuarioRepository.findByLogin(emailAdmin).ifPresentOrElse(
            admin -> log.info("Administrador de bootstrap já existe: {}", admin.getLogin()),
            ()-> {
                UsuarioSistema adminCriado = new UsuarioSistema();
                adminCriado.setLogin(emailAdmin);
                adminCriado.setNome(nomeAdmin);
                adminCriado.setSenha(passwordEncoder.encode(senhaAdmin));
                adminCriado.setRole(UsuarioRole.ADMIN);
                adminCriado.setStatus(StatusUsuario.ATIVO);
                usuarioRepository.save(adminCriado);
                log.info("Administrador de bootstrap criado: {}", emailAdmin);
            }
        );
    }
}
