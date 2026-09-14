package com.example.back_end.NotaFiscal;

public class NotaFiscalMapper {

    public static NotaFiscalDTO toDTO(NotaFiscal nf) {
        // Agora o construtor bate exatamente com o Record acima
        return new NotaFiscalDTO(
            nf.getUuid(),
            nf.getCodigoNota(),
            nf.getFornecedor(),
            nf.getCnpj(),
            nf.getValorTotalNota(),
            nf.getDataEmissao(),
            nf.getStatus(),
            nf.getNotaFiscalUrl(),
            nf.getDataCriacao(),
            nf.getChaveAcesso(),
            nf.isCriadoAutomatico()
            
        );
    }

    public static NotaFiscal toEntity(NotaFiscalDTO dto) {
        NotaFiscal nf = new NotaFiscal();
        
        // No sentido DTO -> Entity, geralmente setamos apenas o que o usuário pode enviar
        nf.setNotaFiscalUrl(dto.notaFiscalUrl()); // Se for record, usa-se .campo()
        nf.setDataEmissao(dto.dataEmissao());
        
        return nf;
    }

    // Para receber dados do Front (Usa o seu DTOE de entrada)
    // public static NotaFiscal toEntity(NotaFiscalDTOE dto) {
    //     NotaFiscal nf = new NotaFiscal();
    //     nf.setNotaFiscalUrl(dto.getNotaFiscalUrl());
    //     nf.setDataEmissao(dto.getDataEmissao());
    //     return nf;
    // }
}