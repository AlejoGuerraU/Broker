package com.broker.backend.persistence.repository;

import com.broker.backend.persistence.entity.OrdenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface OrdenRepository extends JpaRepository<OrdenEntity, Long> {

    List<OrdenEntity> findAllByCuentaBrokerIdOrderByFechaCreacionDescIdDesc(Long cuentaBrokerId);

    List<OrdenEntity> findAllByEstadoOrdenNombreIgnoreCaseOrderByFechaCreacionAscIdAsc(String estadoOrden);

    Optional<OrdenEntity> findByIdAndCuentaBrokerId(Long id, Long cuentaBrokerId);

    @Query("""
            SELECT COALESCE(SUM(o.cantidad), 0)
            FROM OrdenEntity o
            WHERE o.cuentaBroker.id = :cuentaBrokerId
              AND o.activo.id = :activoId
              AND LOWER(o.estadoOrden.nombre) = 'pendiente'
              AND LOWER(o.tipoOperacion.nombre) = 'venta'
            """)
    BigDecimal sumPendingSellQuantity(
            @Param("cuentaBrokerId") Long cuentaBrokerId,
            @Param("activoId") Long activoId
    );

    @Query("""
            SELECT COALESCE(SUM(o.cantidad), 0)
            FROM OrdenEntity o
            WHERE o.cuentaBroker.id = :cuentaBrokerId
              AND o.activo.id = :activoId
              AND LOWER(o.estadoOrden.nombre) = 'pendiente'
              AND LOWER(o.tipoOperacion.nombre) = 'venta'
              AND o.id <> :excludedOrderId
            """)
    BigDecimal sumPendingSellQuantityExcludingOrder(
            @Param("cuentaBrokerId") Long cuentaBrokerId,
            @Param("activoId") Long activoId,
            @Param("excludedOrderId") Long excludedOrderId
    );
}
