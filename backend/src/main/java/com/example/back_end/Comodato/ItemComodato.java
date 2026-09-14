package com.example.back_end.Comodato;

import java.util.UUID;

import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "item_comodato")
public class ItemComodato {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "uuid")
    private UUID uuid;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Comodato comodato;

    @ManyToOne
    @JoinColumn(nullable = false)
    private PatrimonioEspecifico patrimonio;

}
