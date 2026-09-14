package com.example.back_end.Titular.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.back_end.Comodato.Comodato;
import com.example.back_end.Comodato.ComodatoRepository;
import com.example.back_end.Comodato.StatusEnum;
import com.example.back_end.Titular.domain.StatusPerfil;
import com.example.back_end.Titular.domain.Titular;
import com.example.back_end.Titular.dto.ComodatoByTitular;
import com.example.back_end.Titular.dto.TitularDto;
import com.example.back_end.Titular.dto.TitularUpdate;
import com.example.back_end.Titular.mapper.TitularMapper;
import com.example.back_end.Titular.repository.TitularRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class TitularService {

    private final TitularRepository repo;
    private final TitularMapper mapper;
    private final ComodatoRepository comodatoRepository;

    public TitularService(TitularRepository repo, TitularMapper mapper, ComodatoRepository comodatoRepository) {
        this.repo = repo;
        this.mapper = mapper;
        this.comodatoRepository = comodatoRepository;
    }

    public Titular salvar(Titular titular) {
        if(titular.getStatusPerfil() == null) {
            titular.setStatusPerfil(StatusPerfil.ATIVO);
        }
        return repo.save(titular);
    }

    public Page<Titular> consultar(String termoBusca, StatusPerfil statusPerfil, Pageable paginacao) {
        String termo = (termoBusca == null || termoBusca.isBlank()) ? null : termoBusca;
    // Para a busca com filtro, você também deve implementar um JOIN FETCH similar
        return repo.consultar(termo, statusPerfil, paginacao);
    }

    public Titular getById(UUID uuid) {
        return repo.findByIdWithComodatos(uuid).orElseThrow(() -> new EntityNotFoundException("Titular não encontrado com o ID: " + uuid));
    }

    public Titular update(UUID uuid, TitularUpdate titular) {
        Titular titularExistente = repo.findById(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Titular não encontrado"));
                
            if (titular.statusPerfil() == StatusPerfil.INATIVO && titularExistente.getStatusPerfil() == StatusPerfil.ATIVO) {

                //verificar se tem algum comodato em assinatura, esse comodato deve ser cancelado antes
                // só pode cancelar titulares q (se tiver comodato) tiver cancelado ou devolvido ou extraviado

                List<StatusEnum> estadosDePosse = List.of(StatusEnum.ASSINATURA, StatusEnum.PENDENTE, StatusEnum.ATRASADO);
                
                boolean temEquipamentoEmPosse = comodatoRepository.existsByTitularUuidAndEstadoIn(uuid, estadosDePosse);
                
                if (temEquipamentoEmPosse) {
                    throw new IllegalStateException("Não é possível inativar o titular: ele possui equipamentos pendentes de assinatura, de devolução ou em atraso.");
                }
            }

        
        // 3. Atualização Atômica
        if (titular.statusPerfil() != null) {
            titularExistente.setStatusPerfil(titular.statusPerfil());
        }

        // 4. Persistência e retorno da Entidade pura
        return repo.save(titularExistente);
    }

    public void delete(UUID uuid) {
        Titular titular = repo.findById(uuid).orElseThrow(
            () -> new EntityNotFoundException("Titular inexistente"));

        if(titular.getStatusPerfil() == StatusPerfil.ATIVO) {
            throw new IllegalStateException("Titulares com perfil ATIVO não podem ser excluídos.");
        }
        
        repo.deleteById(uuid);
    }
}