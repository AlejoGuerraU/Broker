package com.broker.backend.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tbl_cuenta_broker")
public class CuentaBrokerEntity {

    public enum TipoCuenta {
        demo,
        real
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_persona", nullable = false)
    private PersonaEntity persona;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cuenta", nullable = false)
    private TipoCuenta tipoCuenta;

    @Column(name = "saldo_disponible", nullable = false, precision = 15, scale = 2)
    private BigDecimal saldoDisponible;

    @Column(name = "saldo_congelado", nullable = false, precision = 15, scale = 2)
    private BigDecimal saldoCongelado;

    @Column(name = "saldo_inicial_demo", nullable = false, precision = 15, scale = 2)
    private BigDecimal saldoInicialDemo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_estado_cuenta", nullable = false)
    private EstadoCuentaEntity estadoCuenta;

    @Column(name = "fecha_ultimo_reinicio")
    private LocalDateTime fechaUltimoReinicio;

    public Long getId() {
        return id;
    }

    public PersonaEntity getPersona() {
        return persona;
    }

    public void setPersona(PersonaEntity persona) {
        this.persona = persona;
    }

    public TipoCuenta getTipoCuenta() {
        return tipoCuenta;
    }

    public void setTipoCuenta(TipoCuenta tipoCuenta) {
        this.tipoCuenta = tipoCuenta;
    }

    public BigDecimal getSaldoDisponible() {
        return saldoDisponible;
    }

    public void setSaldoDisponible(BigDecimal saldoDisponible) {
        this.saldoDisponible = saldoDisponible;
    }

    public BigDecimal getSaldoCongelado() {
        return saldoCongelado;
    }

    public void setSaldoCongelado(BigDecimal saldoCongelado) {
        this.saldoCongelado = saldoCongelado;
    }

    public BigDecimal getSaldoInicialDemo() {
        return saldoInicialDemo;
    }

    public void setSaldoInicialDemo(BigDecimal saldoInicialDemo) {
        this.saldoInicialDemo = saldoInicialDemo;
    }

    public EstadoCuentaEntity getEstadoCuenta() {
        return estadoCuenta;
    }

    public void setEstadoCuenta(EstadoCuentaEntity estadoCuenta) {
        this.estadoCuenta = estadoCuenta;
    }

    public LocalDateTime getFechaUltimoReinicio() {
        return fechaUltimoReinicio;
    }

    public void setFechaUltimoReinicio(LocalDateTime fechaUltimoReinicio) {
        this.fechaUltimoReinicio = fechaUltimoReinicio;
    }
}
