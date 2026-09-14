package com.example.back_end.Infra.seguranca.filtro;

import com.example.back_end.Infra.seguranca.service.TokenService;
import com.example.back_end.UsuarioSistema.repository.UsuarioSistemaRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SegurancaFiltro extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UsuarioSistemaRepository userRepository;

    public SegurancaFiltro(TokenService tokenService, UsuarioSistemaRepository userRepository) {
        this.tokenService = tokenService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        
        try {
            String token = this.recoverToken(request);
            if (token != null) {
                String login = tokenService.validateToken(token);

                if (login != null && !login.isEmpty()) {
                    var userOptional = userRepository.findByLogin(login);
                    
                    if (userOptional.isPresent()) {
                        var user = userOptional.get();
                        // Aqui pegamos as authorities REAIS do banco (ex: ROLE_USER agora)
                        var authentication = new UsernamePasswordAuthenticationToken(
                                user, null, user.getAuthorities());
                        
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                } else {
                    // Se o token existe mas o validateToken retornou vazio (expirou/inválido)
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token inválido ou expirado");
                    return; 
                }
            }
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            // Se houver qualquer erro no processo (ex: banco fora), barramos a requisição
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Erro na autenticação");
        }
    }
        
    private String recoverToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if(authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
