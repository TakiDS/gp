package com.example.back_end.PatrimonioEspecifico.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.back_end.Immudb.AutorDTO;
import com.example.back_end.Immudb.DetalhesDiff;
import com.example.back_end.Immudb.MeuTeste.LogFinal;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;
import com.example.back_end.UsuarioSistema.domain.UsuarioSistema;
import com.example.back_end.UsuarioSistema.repository.UsuarioSistemaRepository;

/**
 * Serviço centralizado para auditoria e logging de patrimônios.
 * Responsabilidade única: Registrar todas as mudanças em um local centralizado.
 */
@Service
public class PatrimonioEspecificoAuditService {

    private final LogFinal logFinal;
    private final UsuarioSistemaRepository userRepository;

    private record DadosUsuarioLogado(String nome, String email, String uuid) {}

    public PatrimonioEspecificoAuditService(
            LogFinal logFinal,
            UsuarioSistemaRepository userRepository
    ) {
        this.logFinal = logFinal;
        this.userRepository = userRepository;
    }

    /**
     * Obtém os dados do usuário logado atual.
     * Se não houver usuário, retorna "Sistema".
     */
    public DadosUsuarioLogado obterUsuarioLogado() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            if (auth != null && auth.isAuthenticated()
                    && !"anonymousUser".equals(auth.getPrincipal())) {

                String login = auth.getName();
                
                //alterando o retorno pelo metodo findByLogin retornar um optional 
                UsuarioSistema usuarioReal = userRepository.findByLogin(login).orElseThrow( 
                    () -> new RuntimeException("Usuario não encontrado"));

                if (usuarioReal != null) {
                    return new DadosUsuarioLogado(
                            usuarioReal.getNome(),
                            usuarioReal.getLogin(),
                            usuarioReal.getUuid().toString()
                    );
                }

                return new DadosUsuarioLogado(login, login, "UUID-DESCONHECIDO");
            }
        } catch (Exception e) {
            System.err.println("Erro ao obter usuário logado: " + e.getMessage());
        }

        return new DadosUsuarioLogado("Sistema", "sistema@webacademy.com", "SISTEMA-AUTO");
    }

    /**
     * Registra a criação de um novo patrimônio.
     */
    @Transactional
    public void registrarCriacao(PatrimonioEspecifico patrimonio) {
        DadosUsuarioLogado usuario = obterUsuarioLogado();

        AutorDTO autor = new AutorDTO(usuario.nome, usuario.email);
        DetalhesDiff dif = new DetalhesDiff(patrimonio.getNumPatrimonio(), null, null);

        logFinal.registroFim(patrimonio, "CRIACAO", autor, dif);
    }

    /**
     * Registra uma edição/atualização com mudanças detectadas.
     */
    @Transactional
    public void registrarEdicao(PatrimonioEspecifico patrimonio, Map<String, Object> mudancas) {
        if (mudancas.isEmpty()) {
            return; // Não há mudanças para registrar
        }

        DadosUsuarioLogado usuario = obterUsuarioLogado();

        mudancas.put("uuid", patrimonio.getUuid().toString());
        mudancas.put("numPatrimonio", patrimonio.getNumPatrimonio());

        DetalhesDiff detalhesDiff = new DetalhesDiff(
                patrimonio.getNumPatrimonio(),
                "Alteração de Dados",
                mudancas
        );

        logFinal.registroFim(
                patrimonio,
                "EDICAO",
                new AutorDTO(usuario.nome, usuario.email),
                detalhesDiff
        );
    }

    /**
     * Registra uma movimentação de patrimônio.
     */
    @Transactional
    public void registrarMovimentacao(
            PatrimonioEspecifico patrimonio,
            Map<String, Object> mudancas,
            String observacaoLote
    ) {
        if (mudancas.isEmpty()) {
            return;
        }

        DadosUsuarioLogado usuario = obterUsuarioLogado();

        if (observacaoLote != null && !observacaoLote.isBlank()) {
            mudancas.put("observacao_lote", observacaoLote);
        }

        DetalhesDiff detalhesDiff = new DetalhesDiff(
                patrimonio.getNumPatrimonio(),
                "Movimentação em Lote",
                mudancas
        );

        logFinal.registroFim(
                patrimonio,
                "MOVIMENTACAO",
                new AutorDTO(usuario.nome, usuario.email),
                detalhesDiff
        );
    }

    /**
     * Registra uma saída de patrimônio (Baixa, Doação, Extravio).
     */
    @Transactional
    public void registrarSaida(
            PatrimonioEspecifico patrimonio,
            String estadoAlvo,
            String observacao,
            String urlDocumento
    ) {
        DadosUsuarioLogado usuario = obterUsuarioLogado();

        Map<String, Object> infosSaida = new HashMap<>();
        infosSaida.put("motivo_real", estadoAlvo);
        infosSaida.put("observacao", observacao);
        infosSaida.put("url_documento", urlDocumento);

        logFinal.registroFim(
                patrimonio,
                "SAIDA_PATRIMONIAL",
                new AutorDTO(usuario.nome, usuario.email),
                new DetalhesDiff(patrimonio.getNumPatrimonio(), "Processo de " + estadoAlvo, infosSaida)
        );
    }

    /**
     * Registra uma exclusão lógica de patrimônio.
     */
    @Transactional
    public void registrarDelecao(PatrimonioEspecifico patrimonio, String observacao) {
        DadosUsuarioLogado usuario = obterUsuarioLogado();

        String obs = (observacao != null) ? observacao : "Sem observações.";
        DetalhesDiff diff = new DetalhesDiff(patrimonio.getNumPatrimonio(), obs, null);

        logFinal.registroFim(
                patrimonio,
                "APAGADO",
                new AutorDTO(usuario.nome, usuario.email),
                diff
        );
    }

    /**
     * Registra a criação de um Comodato associado ao patrimônio.
     */
    @Transactional
    public void registrarComodatoCriacao(PatrimonioEspecifico patrimonio, String nomeTitular) {
        DadosUsuarioLogado usuario = obterUsuarioLogado();

        Map<String, Object> infos = new HashMap<>();
        infos.put("status_inicial", "Aguardando Assinatura");
        infos.put("titular_vinculado", nomeTitular != null ? nomeTitular : "Não informado");

        DetalhesDiff diff = new DetalhesDiff(
                patrimonio.getNumPatrimonio(),
                "Criação de Registro de Comodato",
                infos
        );

        logFinal.registroFim(
                patrimonio,
                "COMODATO_CRIADO",
                new AutorDTO(usuario.nome(), usuario.email()),
                diff
        );
    }

    /**
     * Registra a assinatura do Termo de Comodato associado ao patrimônio.
     */
    @Transactional
    public void registrarComodatoAssinatura(PatrimonioEspecifico patrimonio, String urlTermo) { // <-- 1. Adicionado parâmetro da URL
        DadosUsuarioLogado usuario = obterUsuarioLogado();

        Map<String, Object> infos = new HashMap<>();
        infos.put("status_atualizado", "Ativo / Assinado");
        infos.put("observacao", "Termo de comodato assinado eletronicamente com sucesso.");
        
        // <-- 2. Adiciona a URL do documento se ela existir
        if (urlTermo != null && !urlTermo.isBlank()) {
            infos.put("url_documento", urlTermo); 
        }

        DetalhesDiff diff = new DetalhesDiff(
                patrimonio.getNumPatrimonio(),
                "Assinatura de Termo de Comodato",
                infos
        );

        logFinal.registroFim(
                patrimonio,
                "COMODATO_ASSINADO",
                new AutorDTO(usuario.nome(), usuario.email()),
                diff
        );
    }

    /**
     * Registra a devolução de um Comodato associado ao patrimônio.
     */
    @Transactional
    public void registrarComodatoDevolucao(PatrimonioEspecifico patrimonio, String observacao) {
        DadosUsuarioLogado usuario = obterUsuarioLogado();

        Map<String, Object> infos = new HashMap<>();
        infos.put("observacao_devolucao", observacao != null ? observacao : "Sem observações");

        DetalhesDiff diff = new DetalhesDiff(
                patrimonio.getNumPatrimonio(),
                "Devolução de Comodato",
                infos
        );

        logFinal.registroFim(
                patrimonio,
                "COMODATO_DEVOLUCAO",
                new AutorDTO(usuario.nome(), usuario.email()),
                diff
        );
    }

    /**
     * Registra o cancelamento de um Comodato associado ao patrimônio.
     */
    @Transactional
    public void registrarComodatoCancelamento(PatrimonioEspecifico patrimonio, String motivoCancelamento) {
        DadosUsuarioLogado usuario = obterUsuarioLogado();

        Map<String, Object> infos = new HashMap<>();
        infos.put("motivo_cancelamento", motivoCancelamento != null ? motivoCancelamento : "Motivo não informado");

        DetalhesDiff diff = new DetalhesDiff(
                patrimonio.getNumPatrimonio(),
                "Cancelamento de Comodato",
                infos
        );

        logFinal.registroFim(
                patrimonio,
                "COMODATO_CANCELADO",
                new AutorDTO(usuario.nome(), usuario.email()),
                diff
        );
    }

    /**
     * Registra a deleção (exclusão) do registro de um Comodato associado ao patrimônio.
     */
    @Transactional
    public void registrarComodatoDelecao(PatrimonioEspecifico patrimonio, String justificativa) {
        DadosUsuarioLogado usuario = obterUsuarioLogado();

        Map<String, Object> infos = new HashMap<>();
        infos.put("justificativa_delecao", justificativa != null ? justificativa : "Sem justificativa");

        DetalhesDiff diff = new DetalhesDiff(
                patrimonio.getNumPatrimonio(),
                "Exclusão de Registro de Comodato",
                infos
        );

        logFinal.registroFim(
                patrimonio,
                "COMODATO_DELETADO",
                new AutorDTO(usuario.nome(), usuario.email()),
                diff
        );
    }
}
