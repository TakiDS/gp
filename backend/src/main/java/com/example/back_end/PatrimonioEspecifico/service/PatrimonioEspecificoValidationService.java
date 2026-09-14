package com.example.back_end.PatrimonioEspecifico.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.back_end.Comodato.Comodato;
import com.example.back_end.PatrimonioEspecifico.EstadoEnum;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecificoRepository;

/**
 * Serviço responsável por validações e regras de negócio de Patrimônio Específico.
 * Responsabilidade única: Validações e regras de negócio.
 */
@Service
public class PatrimonioEspecificoValidationService {

    private final PatrimonioEspecificoRepository repository;

    public PatrimonioEspecificoValidationService(
            PatrimonioEspecificoRepository repository
    ) {
        this.repository = repository;
    }

    /**
     * Valida o número de série (se fornecido).
     * @throws RuntimeException se número de série já existe
     */
    public void validarNumeroSerie(String numSerie) {
        if (numSerie != null && !numSerie.trim().isBlank()) {
            boolean existe = repository.existsByNumSerie(numSerie.trim());
            if (existe) {
                throw new RuntimeException("Já existe um patrimônio cadastrado com esse número de série.");
            }
        }
    
    }

    /**
     * Valida se o número de série é único (excluindo o próprio patrimônio).
     * Usado na atualização.
     * @throws RuntimeException se número de série já existe para outro patrimônio
     */
    public void validarNumeroSerieUnico(String numSerie, UUID uuidExcluir) {
        if (numSerie != null && !numSerie.trim().isBlank()) {
            boolean existe = repository.existsByNumSerieAndUuidNot(numSerie.trim(), uuidExcluir);
            if (existe) {
                throw new RuntimeException("O número de série " + numSerie + " já está em uso.");
            }
        }
    }

    /**
     * Aplica regras de negócio ao patrimônio.
     * - Se estado não permite local, remove localização
     * - Se em comodato com termo validado, remove localização
     */
    public void aplicarRegrasNegocio(PatrimonioEspecifico patrimonio) {
        // Regra 1: Estado não permite local?
        if (!patrimonio.getEstado().permiteLocal()) {
            patrimonio.setLocalizacao(null);
        }

        // Regra 2: Em comodato com termo validado?
        Comodato comodato = patrimonio.getComodato();
        if (comodato != null && comodato.isValidacaoTermo()) {
            patrimonio.setLocalizacao(null);
        }
    }

    /**
     * Valida se um patrimônio pode ser editado.
     * @throws IllegalStateException se não pode ser editado
     */
    public void validarEdicao(PatrimonioEspecifico patrimonio) {
        if (!patrimonio.getEstado().permiteEdicao()) {
            throw new IllegalStateException(
                    "Patrimônio com estado " + patrimonio.getEstado() + " não pode ser editado."
            );
        }
    }

    //Valida se a Nota Fiscal do patrimonio pode se editada
    public void validarEditNota(PatrimonioEspecifico patrimonio) {
        if (patrimonio.getPatrimonioGeral().isPatrimonioAutomatico()){
            throw new IllegalStateException(
                "Proibido mudança de notas para patrimonios gerados automaticamentes."
            );
        }
    }

    /**
     * Valida se um patrimônio pode ser emprestado (comodato).
     * @throws IllegalStateException se não pode ser emprestado
     */
    @Transactional(readOnly = true)
    public void validarEmprestimo(PatrimonioEspecifico patrimonio) {
        Comodato comodato = patrimonio.getComodato();
        if (comodato == null || !comodato.isValidacaoTermo()) {
            throw new IllegalStateException(
                    "Não é possível colocar em EMPRESTIMO sem termo de comodato assinado."
            );
        }
    }

    /**
     * Limpa referências quando estado muda.
     */
    public void limparReferenciasAoMudarEstado(PatrimonioEspecifico patrimonio, EstadoEnum novoEstado) {
        if (!novoEstado.permiteRetornarDadoComodato()) {
            patrimonio.setComodato(null);
        }
    }
}
