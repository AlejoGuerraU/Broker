package com.broker.backend.persistence.repository;

import com.broker.backend.persistence.entity.PosicionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PosicionRepository extends JpaRepository<PosicionEntity, Long> {

    List<PosicionEntity> findAllByCuentaBrokerIdOrderByActivoSimboloAsc(Long cuentaBrokerId);

    Optional<PosicionEntity> findByCuentaBrokerIdAndActivoId(Long cuentaBrokerId, Long activoId);
}
