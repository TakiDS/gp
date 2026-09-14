package com.example.back_end.PatrimonioEspecifico.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.back_end.Infra.sequence.Sequencia;
import com.example.back_end.Infra.sequence.SequenciaRepository;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecificoConfig;

/**
 * Serviço responsável pela geração de números de patrimônio sequenciais.
 * Responsabilidade única: Gestão de números sequenciais.
 */
@Service
public class PatrimonioEspecificoSequenceService {

    private final SequenciaRepository sequenciaRepository;
    private final PatrimonioEspecificoConfig config;

    public PatrimonioEspecificoSequenceService(
            SequenciaRepository sequenciaRepository,
            PatrimonioEspecificoConfig config
    ) {
        this.sequenciaRepository = sequenciaRepository;
        this.config = config;
    }

    /**
     * Gera o próximo número sequencial para patrimônio.
     * @return String no formato "PREFIX-000001"
     */
    @Transactional
    public String gerarNumPatrimonio() {
        String chave = config.getPrefixo();
        
        // A MUDANÇA ESTÁ AQUI: Usando o método com bloqueio!
        Sequencia seq = sequenciaRepository.findByChaveComBloqueio(chave).orElseGet(() -> {
            Sequencia nova = new Sequencia();
            nova.setChave(chave);
            nova.setUltimoValor(0);
            return nova;
        });

        int proximo = seq.getUltimoValor() + 1;
        seq.setUltimoValor(proximo);
        sequenciaRepository.save(seq);

        return chave + "-" + String.format("%06d", proximo);
    }
}
