package com.example.back_end.Localizacao;

import java.io.File;
import java.nio.file.Files;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.back_end.Localizacao.auditoria.GerarDocumentoAuditoria;

import jakarta.validation.Valid;




@RestController
@RequestMapping("/local")
public class LocalizacaoController {
    private final LocalizacaoService servico;
    private final LocalizacaoMapper mapper;
    private final GerarDocumentoAuditoria gerarDocumentoAuditoria;

    public LocalizacaoController(LocalizacaoService servico, LocalizacaoMapper mapper, GerarDocumentoAuditoria gerarDocumentoAuditoria) {
        this.servico = servico;
        this.mapper = mapper;
        this.gerarDocumentoAuditoria = gerarDocumentoAuditoria;
    }


    //cadastrar
    @PostMapping
    public ResponseEntity<LocalizacaoResponseDto> cadastrar(@RequestBody @Valid LocalizacaoResponseDto objeto) {
        Localizacao entity = mapper.toEntityy(objeto);
        Localizacao salvo = servico.salvar(entity);

        LocalizacaoResponseDto dto = mapper.toDtoo(salvo);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    //consultar (ok)
    @GetMapping
    public ResponseEntity<Page<LocalizacaoResponseDto>> consultar(
        @RequestParam (required = false) String termoBusca, Pageable paginacao
    ) {
        Page<Localizacao> registros = servico.consultar(termoBusca, paginacao);

        if(registros.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        Page<LocalizacaoResponseDto> dtos = registros.map(mapper::toDtoo);

        return ResponseEntity.status(HttpStatus.OK).body(dtos);
    }

    //conultar por id
    @GetMapping("/{uuid}") //aqui retorna os patrimonios referentes ao uuid do local x
    public ResponseEntity<PatrimonioEspecificoPorLocalDto> consultarPeloUuid(
        @PathVariable UUID uuid,
        @RequestParam (required = false) String termoBusca, Pageable paginacao
    ) {
        Localizacao localizacao = servico.buscarPorUuid(uuid, termoBusca, paginacao);
        PatrimonioEspecificoPorLocalDto registros = mapper.toDto(localizacao);
        
        return ResponseEntity.status(HttpStatus.OK).body(registros);
    }

    //Atualizar local
    @PutMapping("/{uuid}")
    public ResponseEntity<LocalizacaoUpdateDto> atualizar(@PathVariable UUID uuid, @RequestBody LocalizacaoUpdateDto objeto) {
        Localizacao entity = mapper.toEntityyy(objeto);
        Localizacao salvo = servico.atualizar(uuid, entity);
        LocalizacaoUpdateDto dto = mapper.toDtooo(salvo);

        return ResponseEntity.status(HttpStatus.OK).body(dto);
    }
    
    //Deletar local
    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> deletar(@PathVariable UUID uuid) {
        servico.deletar(uuid);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
    
    //gerar doc de auditoria
    @GetMapping("/{uuid}/gerar-auditoria")
    public ResponseEntity<byte[]> gerarEBaixarAuditoria(@PathVariable UUID uuid) {
        try {
            // 1. O seu service já faz tudo: gera o PDF e salva a URL na entidade
            String caminhoPdf = gerarDocumentoAuditoria.gerarEAtualizarTermo(uuid);
            
            // 2. Lê o arquivo gerado do disco para um array de bytes
            File arquivo = new File(caminhoPdf);
            byte[] conteudo = Files.readAllBytes(arquivo.toPath());
            Files.deleteIfExists(arquivo.toPath());
            
            // 3. Retorna o conteúdo com os headers de download
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"auditoria_" + uuid + ".pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(conteudo);
                    
        } catch (Exception e) {
            e.printStackTrace(); 
            return ResponseEntity.internalServerError().build();
        }
    }
}
