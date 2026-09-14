package com.example.back_end;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class BackEndApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackEndApplication.class, args);
	}

	// Esse método roda automaticamente assim que o Spring Boot levanta
    @PostConstruct
    public void init() {
        // Força o fuso horário de toda a aplicação para o horário do Acre (UTC-5)
        TimeZone.setDefault(TimeZone.getTimeZone("America/Rio_Branco"));
    }

}
