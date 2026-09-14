package com.example.back_end.Infra.excecoes;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestControllerAdvice
public class RestExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(RestExceptionHandler.class);

    // --- 404: Não Encontrado ---
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<RestErrorMessage> handleEntityNotFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new RestErrorMessage(HttpStatus.NOT_FOUND, "Recurso não encontrado."));
    }

    // --- 400: Validação de Campos (Trata as anotações @Valid, @NotBlank, etc) ---
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<List<DadosErroValidacao>> handleValidation(MethodArgumentNotValidException ex) {
        var erros = ex.getFieldErrors().stream()
                .map(DadosErroValidacao::new)
                .collect(Collectors.toList());
        return ResponseEntity.badRequest().body(erros);
    }

    // --- 401: Senha ou Login Incorretos ---
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<RestErrorMessage> handleBadCredentials() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new RestErrorMessage(HttpStatus.UNAUTHORIZED, "Usuário inexistente ou senha inválida."));
    }

    // --- 403: Sem permissão (Ex: Gerenciador tentando acessar rota de Gestor) ---
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<RestErrorMessage> handleAccessDenied() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new RestErrorMessage(HttpStatus.FORBIDDEN, "Acesso negado. Você não tem permissão."));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<RestErrorMessage> handleInvalidArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
                .body(new RestErrorMessage(HttpStatus.BAD_REQUEST, ex.getMessage()));
    }

    // --- 409 ou 400: Erros de Regra de Negócio específicos ---
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<RestErrorMessage> handleBusinessException(BusinessException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT) // 409 é ideal para conflitos de vínculo
                .body(new RestErrorMessage(HttpStatus.CONFLICT, ex.getMessage()));
    }

    // --- Manter o DataIntegrity como um "Seguro Morreu de Velho" ---
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<RestErrorMessage> handleDataIntegrity(DataIntegrityViolationException ex) {
        String msg = ex.getMostSpecificCause().getMessage();
        
        // Se no erro do banco aparecer a palavra 'unique' ou o nome da sua constraint
        if (msg != null && (msg.contains("unique") || msg.contains("uk_"))) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new RestErrorMessage(HttpStatus.CONFLICT, "Já existe um registro com esse dado único (ex: número de série)."));
        }

        // Se não for duplicidade, aí sim é o erro de vínculo (Foreign Key)
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new RestErrorMessage(HttpStatus.CONFLICT, "Este registro não pode ser alterado/removido pois possui vínculos ativos."));
    }

    // --- 413: Arquivo muito grande ---
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<RestErrorMessage> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(new RestErrorMessage(HttpStatus.PAYLOAD_TOO_LARGE, "O arquivo é muito grande! Limite máximo é 10MB."));
    }

    // --- 500: Genérico (Erros inesperados do código) ---
    @ExceptionHandler(Exception.class)
    public ResponseEntity<RestErrorMessage> handleGenericException(Exception ex) {
        log.error("Erro interno não tratado", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new RestErrorMessage(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Ocorreu um erro interno. Tente novamente mais tarde."));
    }

    // Record auxiliar
    public record DadosErroValidacao(String campo, String mensagem) {
        public DadosErroValidacao(FieldError erro) {
            this(erro.getField(), erro.getDefaultMessage());
        }
    }
}
