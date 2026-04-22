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
import java.time.LocalDateTime;

@Entity
@Table(name = "tbl_historial_precios")
public class HistorialPrecioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_activo", nullable = false)
    private ActivoEntity activo;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(name = "precio_apertura", nullable = false, precision = 15, scale = 2)
    private BigDecimal precioApertura;

    @Column(name = "precio_maximo", nullable = false, precision = 15, scale = 2)
    private BigDecimal precioMaximo;

    @Column(name = "precio_minimo", nullable = false, precision = 15, scale = 2)
    private BigDecimal precioMinimo;

    @Column(name = "precio_cierre", nullable = false, precision = 15, scale = 2)
    private BigDecimal precioCierre;

    public Long getId() {
        return id;
    }

    public ActivoEntity getActivo() {
        return activo;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public BigDecimal getPrecioCierre() {
        return precioCierre;
    }

    public void setActivo(ActivoEntity activo) {
        this.activo = activo;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public void setPrecioApertura(BigDecimal precioApertura) {
        this.precioApertura = precioApertura;
    }

    public void setPrecioMaximo(BigDecimal precioMaximo) {
        this.precioMaximo = precioMaximo;
    }

    public void setPrecioMinimo(BigDecimal precioMinimo) {
        this.precioMinimo = precioMinimo;
    }

    public void setPrecioCierre(BigDecimal precioCierre) {
        this.precioCierre = precioCierre;
    }
}
