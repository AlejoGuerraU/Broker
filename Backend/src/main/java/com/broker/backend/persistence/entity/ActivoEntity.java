package com.broker.backend.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "tbl_activo")
public class ActivoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String nombre;

    @Column(nullable = false, length = 20)
    private String simbolo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_tipo_activo", nullable = false)
    private TipoActivoEntity tipoActivo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_estado_activo", nullable = false)
    private EstadoActivoEntity estadoActivo;

    @Column(name = "precio_actual", nullable = false, precision = 15, scale = 2)
    private BigDecimal precioActual;

    @Column(length = 80)
    private String mercado;

    @Column(nullable = false, length = 10)
    private String moneda;

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getSimbolo() {
        return simbolo;
    }

    public TipoActivoEntity getTipoActivo() {
        return tipoActivo;
    }

    public EstadoActivoEntity getEstadoActivo() {
        return estadoActivo;
    }

    public BigDecimal getPrecioActual() {
        return precioActual;
    }

    public String getMercado() {
        return mercado;
    }

    public String getMoneda() {
        return moneda;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setSimbolo(String simbolo) {
        this.simbolo = simbolo;
    }

    public void setTipoActivo(TipoActivoEntity tipoActivo) {
        this.tipoActivo = tipoActivo;
    }

    public void setEstadoActivo(EstadoActivoEntity estadoActivo) {
        this.estadoActivo = estadoActivo;
    }

    public void setPrecioActual(BigDecimal precioActual) {
        this.precioActual = precioActual;
    }

    public void setMercado(String mercado) {
        this.mercado = mercado;
    }

    public void setMoneda(String moneda) {
        this.moneda = moneda;
    }
}
