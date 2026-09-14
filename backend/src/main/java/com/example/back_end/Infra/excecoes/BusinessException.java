package com.example.back_end.Infra.excecoes;

public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
