package com.broker.backend.persistence.repository;

import com.broker.backend.persistence.entity.OrdenEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrdenRepository extends JpaRepository<OrdenEntity, Long> {

    List<OrdenEntity> findAllByCuentaBrokerIdOrderByFechaCreacionDescIdDesc(Long cuentaBrokerId);

    List<OrdenEntity> findAllByEstadoOrdenNombreIgnoreCaseOrderByFechaCreacionAscIdAsc(String estadoOrden);
}
