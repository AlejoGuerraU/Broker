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
@Table(name = "tbl_posicion")
public class PosicionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_cuenta_broker", nullable = false)
    private CuentaBrokerEntity cuentaBroker;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_activo", nullable = false)
    private ActivoEntity activo;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal cantidad;

    @Column(name = "precio_promedio", nullable = false, precision = 15, scale = 2)
    private BigDecimal precioPromedio;

    public Long getId() {
        return id;
    }

    public CuentaBrokerEntity getCuentaBroker() {
        return cuentaBroker;
    }

    public ActivoEntity getActivo() {
        return activo;
    }

    public BigDecimal getCantidad() {
        return cantidad;
    }

    public BigDecimal getPrecioPromedio() {
        return precioPromedio;
    }

    public void setCuentaBroker(CuentaBrokerEntity cuentaBroker) {
        this.cuentaBroker = cuentaBroker;
    }

    public void setActivo(ActivoEntity activo) {
        this.activo = activo;
    }

    public void setCantidad(BigDecimal cantidad) {
        this.cantidad = cantidad;
    }

    public void setPrecioPromedio(BigDecimal precioPromedio) {
        this.precioPromedio = precioPromedio;
    }
}
