package com.broker.backend.persistence.repository;

import com.broker.backend.persistence.entity.MovimientoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MovimientoRepository extends JpaRepository<MovimientoEntity, Long> {

    List<MovimientoEntity> findAllByCuentaGestorIdOrderByFechaDescIdDesc(Long cuentaGestorId);

    Optional<MovimientoEntity> findByIdAndCuentaGestorId(Long id, Long cuentaGestorId);
}
