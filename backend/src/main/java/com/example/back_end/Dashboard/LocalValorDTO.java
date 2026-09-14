package com.example.back_end.Dashboard;

import java.math.BigDecimal;
import java.util.List;

public record LocalValorDTO(
    String local, 
    BigDecimal valorTotal, 
    List<StatusCountDTO> status // <-- Adicionamos a lista aqui!
) {}
