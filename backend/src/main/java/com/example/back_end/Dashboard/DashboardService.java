package com.example.back_end.Dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.back_end.Comodato.Comodato;
import com.example.back_end.Comodato.ComodatoRepository;
import com.example.back_end.Comodato.StatusEnum;
import com.example.back_end.Immudb.MeuTeste.DetalhesDTO;
import com.example.back_end.Immudb.MeuTeste.LogFinal;
import com.example.back_end.NotaFiscal.NotaFiscalRepository;
import com.example.back_end.PatrimonioEspecifico.EstadoEnum;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecificoRepository;

@Service
public class DashboardService {

    @Autowired
    private PatrimonioEspecificoRepository repo;
    @Autowired
    private NotaFiscalRepository notaRepo;
    @Autowired
    private ComodatoRepository comodatoRepo;

    //Historico aqui
    @Autowired
    private LogFinal logFinal;

    public DashboardDTO getResumo() {
        long total = repo.countTotal();
        long notas = notaRepo.count();
        BigDecimal valor = repo.sumValorTotal();

        // Converte a lista de Object[] para um Map amigável
        Map<String, Long> categorias = repo.countByCategoria().stream()
                .collect(Collectors.toMap(obj -> (String) obj[0], obj -> (Long) obj[1]));

        return new DashboardDTO(total, notas, valor, categorias, null);
    }

    public DashboardScreenDTO getDados(UUID localId, EstadoEnum status, LocalDate dataInicio, LocalDate dataFim) {
        // 1. Soma total financeira atual com 4 filtros
        BigDecimal valorTotal = repo.sumValorTotalFiltrado(localId, status, dataInicio, dataFim);
        valorTotal = valorTotal != null ? valorTotal : BigDecimal.ZERO;

        // 2. Lógica do Período Anterior
        BigDecimal valorAnterior = BigDecimal.ZERO;

        if (dataInicio != null && dataFim != null) {
            long diasIntervalo = ChronoUnit.DAYS.between(dataInicio, dataFim);
            LocalDate fimAnterior = dataInicio.minusDays(1);
            LocalDate inicioAnterior = fimAnterior.minusDays(diasIntervalo);
            valorAnterior = repo.sumValorTotalFiltrado(localId, status, inicioAnterior, fimAnterior);
        } else {
            LocalDate mesPassado = LocalDate.now().minusMonths(1);
            valorAnterior = repo.sumValorTotalFiltrado(localId, status, null, mesPassado);
        }

        valorAnterior = valorAnterior != null ? valorAnterior : BigDecimal.ZERO;

        // 3. Calcula o percentual de crescimento
        BigDecimal percentualCrescimento = BigDecimal.ZERO;
        if (valorAnterior.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal diferenca = valorTotal.subtract(valorAnterior);
            percentualCrescimento = diferenca
                    .divide(valorAnterior, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        } else if (valorTotal.compareTo(BigDecimal.ZERO) > 0) {
            percentualCrescimento = new BigDecimal("100.00");
        }

        // 4. Contagens repassando o estadoFiltro
        long total = repo.countTotalFiltrado(localId, status, dataInicio, dataFim);

        // Atenção aqui: passamos o estado esperado pelo card E o estado do filtro global
        long guardados = repo.countByStatusFiltrado(EstadoEnum.GUARDADO, status, localId, dataInicio, dataFim);
        long emUso = repo.countByStatusFiltrado(EstadoEnum.USO, status, localId, dataInicio, dataFim);

        long pendencias = repo.countPendenciasNfFiltrado(localId, status, dataInicio, dataFim);

        return new DashboardScreenDTO(
                valorTotal,
                percentualCrescimento,
                total,
                guardados,
                emUso,
                pendencias);
    }

    public DashboardGraficoResponse getDadosGrafico() {
        List<CategoriaValorDTO> graficoCategoria = repo.findValorTotalPorCategoria();

        // Soma todos os valores das categorias para ter o valorTotal geral
        BigDecimal valorTotalGlobal = graficoCategoria.stream()
                .map(CategoriaValorDTO::totalValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardGraficoResponse(
                Map.of("valorTotal", valorTotalGlobal),
                graficoCategoria);
    }

    public DashboardGraficosDTO getDadosGraficos() {
        // 1. Busca os dados gerais (Status Geral) e Valores por Local do banco
        List<Object[]> dadosStatus = repo.countByStatusAgrupado();
        List<Object[]> dadosLocal = repo.sumValorPorLocalAgrupado();

        // 2. NOVO: Busca os status agrupados por local
        List<Object[]> dadosStatusPorLocal = repo.countStatusPorLocalAgrupado();

        // 3. Converte os Status Gerais para DTO
        List<StatusCountDTO> statusGeralList = dadosStatus.stream()
                .map(obj -> new StatusCountDTO(obj[0].toString(), (Long) obj[1]))
                .toList();

        // 4. NOVO: Agrupa os status por nome do Local usando Java Streams
        // O retorno será um Map onde a chave é o nome do Local e o valor é a Lista de StatusCountDTO dele
        Map<String, List<StatusCountDTO>> mapStatusPorLocal = dadosStatusPorLocal.stream()
                .collect(Collectors.groupingBy(
                        // Chave do Map (Nome do local, trata nulo caso exista patrimônio sem local)
                        obj -> obj[0] != null ? obj[0].toString() : "Sem Local",
                        // Valor do Map (Cria o DTO e joga numa lista)
                        Collectors.mapping(
                                obj -> new StatusCountDTO(obj[1].toString(), (Long) obj[2]),
                                Collectors.toList()
                        )
                ));

        // 5. Monta a lista final de Locais, injetando a lista de status de cada um
        List<LocalValorDTO> localList = dadosLocal.stream()
                .map(obj -> {
                    String nomeLocal = obj[0] != null ? obj[0].toString() : "Sem Local";
                    BigDecimal valorTotal = (BigDecimal) obj[1];

                    // Pega a lista de status específica desse local, ou uma lista vazia se não tiver nada
                    List<StatusCountDTO> statusDoLocal = mapStatusPorLocal.getOrDefault(nomeLocal, List.of());

                    // Retorna o DTO com o novo parâmetro
                    return new LocalValorDTO(nomeLocal, valorTotal, statusDoLocal);
                })
                .toList();

        return new DashboardGraficosDTO(statusGeralList, localList);
    }

    public List<devolucoesProximas> movimentacoesDevolucao() {
        List<Comodato> meuRepo = comodatoRepo.findTop2ByEstadoOrderByDataFimEsperado(StatusEnum.PENDENTE);

        List<devolucoesProximas> dtos = meuRepo.stream()
                .map(comodato -> new devolucoesProximas(
                comodato.getUuid(),
                comodato.getPatrimonios(),
                comodato.getTitular().getNome().toString(),
                comodato.getDataFimEsperado()))
                .collect(Collectors.toList());

        return dtos;
    }

    public DashboardCompletoDTO getDashboardCompleto(UUID localId, EstadoEnum status, LocalDate dataInicio, LocalDate dataFim) {
        // Reaproveita os métodos que você já escreveu
        DashboardScreenDTO cards = this.getDados(localId, status, dataInicio, dataFim);
        DashboardGraficosDTO graficos = this.getDadosGraficos();
        List<devolucoesProximas> prox = this.movimentacoesDevolucao();

        //Busca as ultimas 3
        Pageable top3 = PageRequest.of(0, 2);
        List<DetalhesDTO> historico = logFinal.buscarTodosHistoricos(top3).getContent();

        return new DashboardCompletoDTO(cards, graficos, prox, historico);
    }
}
