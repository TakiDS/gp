package com.example.back_end.Comodato;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.back_end.Titular.dto.TitularPorComodato;

import jakarta.validation.Valid;



@RestController
@RequestMapping("/comodato")
public class ComodatoController {
    private final ComodatoService servico;
    private final ComodatoMapper mapper;

    public ComodatoController(ComodatoService servico, ComodatoMapper mapper) {
        this.servico = servico;
        this.mapper = mapper;
    }

    //cadastrar comodato
    @PostMapping
    public ResponseEntity<ComodatoRetorno> cadastrar(@RequestBody @Valid ComodatoDto objeto) {
        Comodato salvo = servico.salvar(objeto);
        ComodatoRetorno retorno = mapper.toDtoooo(salvo);

        return ResponseEntity.status(HttpStatus.CREATED).body(retorno);
    }

    //chamar front para assinatura no banco --ver 
    @GetMapping("/assinar-termo")
    public ResponseEntity<Map<String, String>> efetivarAssinatura(@RequestParam String token) {
        // Esta única chamada ao service fará tudo: 
        // Valida -> Muda booleano para true -> Gera PDF -> Limpa Token -> Salva no Banco
        String urlTermo = servico.assinar(token);

        return ResponseEntity.ok(Map.of("url", urlTermo));
    }

    //retornando todos os comodatos
    @Transactional(readOnly = true)
    @GetMapping
    public ResponseEntity<Page<ComodatoResponse>> consultar(
            @RequestParam (required = false) String termoBusca,
            @RequestParam (required = false) StatusEnum estado,
            Pageable paginacao
        ) {
        Page<Comodato> registros = servico.consultar(termoBusca, estado,paginacao);

        if(registros.isEmpty()){
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }

        Page<ComodatoResponse> dtos = registros.map(mapper::toResponse);
        
        return ResponseEntity.status(HttpStatus.OK).body(dtos);
    }

    // //verificar
    // @GetMapping("/ativos")
    // public ResponseEntity<List<ComodatoDto>> listarAtivos() {
    //     List<ComodatoDto> dtos = servico.consultarAtivos().stream().map(mapper::toDto).toList();
    //     return ResponseEntity.ok().body(dtos);
    // }


    //buscar comodato por uuid
    @GetMapping("/{uuid}")
    public ResponseEntity<ComodatoPorUuid> consultarPorId(@PathVariable @Valid UUID uuid) {
        Comodato entidade = servico.consultarPorUuid(uuid);
        
        TitularPorComodato titularDto = new TitularPorComodato(
        entidade.getTitular().getUuid(),
            entidade.getTitular().getNome(),
            entidade.getTitular().getEmail()
        );

    // 2. Criar a lista de DTOs dos Patrimônios
        List<PatrimonioResumoResponse> patrimoniosDto = entidade.getPatrimonios().stream()
            .map(p -> new PatrimonioResumoResponse(
                p.getUuid(),
                p.getPatrimonioGeral().getDescricao(), 
                p.getNumPatrimonio(),
                p.getEstado(),
                p.getEstadoFinalComodato()
            ))
            .toList();
        

        ComodatoPorUuid dto = new ComodatoPorUuid(
            entidade.getUuid(),
            entidade.getDataInicio(),
            entidade.getDataFimEsperado(),
            entidade.getDataFim(),
            entidade.isValidacaoTermo(),
            entidade.getTermoUrl(),
            entidade.getEstado(),
            titularDto,
            patrimoniosDto
            
        );
        return ResponseEntity.status(HttpStatus.OK).body(dto);
    }

    //atualizar somente o estado (pra aqueles 3 pontinhos)
    @PatchMapping("/{uuid}")
    public ResponseEntity<ComodatoDto> atualizarEstado(@PathVariable UUID uuid, @RequestBody @Valid ComodatoStatusUpdateRequest request){
        Comodato objeto = servico.atualizarEstado(uuid, request.estado());
        ComodatoDto dto = mapper.toDto(objeto);
        return ResponseEntity.status(HttpStatus.OK).body(dto);
    }


    //deletar comodato que foi cancelado
    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> deletar(@PathVariable @Valid UUID uuid) {
        servico.deletar(uuid);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    
}
