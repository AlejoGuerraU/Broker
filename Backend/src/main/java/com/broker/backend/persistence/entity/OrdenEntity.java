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
@Table(name = "tbl_orden")
public class OrdenEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_cuenta_broker", nullable = false)
    private CuentaBrokerEntity cuentaBroker;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_activo", nullable = false)
    private ActivoEntity activo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_estado_orden", nullable = false)
    private EstadoOrdenEntity estadoOrden;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_tipo_orden", nullable = false)
    private TipoOrdenEntity tipoOrden;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_tipo_operacion", nullable = false)
    private TipoOperacionEntity tipoOperacion;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal cantidad;

    @Column(name = "precio_referencia", nullable = false, precision = 15, scale = 2)
    private BigDecimal precioReferencia;

    @Column(name = "precio_ejecucion", precision = 15, scale = 2)
    private BigDecimal precioEjecucion;

    @Column(name = "valor_total", precision = 15, scale = 2)
    private BigDecimal valorTotal;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_ejecucion")
    private LocalDateTime fechaEjecucion;

    public Long getId() {
        return id;
    }

    public CuentaBrokerEntity getCuentaBroker() {
        return cuentaBroker;
    }

    public ActivoEntity getActivo() {
        return activo;
    }

    public EstadoOrdenEntity getEstadoOrden() {
        return estadoOrden;
    }

    public TipoOrdenEntity getTipoOrden() {
        return tipoOrden;
    }

    public TipoOperacionEntity getTipoOperacion() {
        return tipoOperacion;
    }

    public BigDecimal getCantidad() {
        return cantidad;
    }

    public BigDecimal getPrecioReferencia() {
        return precioReferencia;
    }

    public BigDecimal getPrecioEjecucion() {
        return precioEjecucion;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public LocalDateTime getFechaEjecucion() {
        return fechaEjecucion;
    }

    public void setCuentaBroker(CuentaBrokerEntity cuentaBroker) {
        this.cuentaBroker = cuentaBroker;
    }

    public void setActivo(ActivoEntity activo) {
        this.activo = activo;
    }

    public void setEstadoOrden(EstadoOrdenEntity estadoOrden) {
        this.estadoOrden = estadoOrden;
    }

    public void setTipoOrden(TipoOrdenEntity tipoOrden) {
        this.tipoOrden = tipoOrden;
    }

    public void setTipoOperacion(TipoOperacionEntity tipoOperacion) {
        this.tipoOperacion = tipoOperacion;
    }

    public void setCantidad(BigDecimal cantidad) {
        this.cantidad = cantidad;
    }

    public void setPrecioReferencia(BigDecimal precioReferencia) {
        this.precioReferencia = precioReferencia;
    }

    public void setPrecioEjecucion(BigDecimal precioEjecucion) {
        this.precioEjecucion = precioEjecucion;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public void setFechaEjecucion(LocalDateTime fechaEjecucion) {
        this.fechaEjecucion = fechaEjecucion;
    }
}
