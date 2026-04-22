package com.broker.backend.persistence.repository;

import com.broker.backend.persistence.entity.TipoMovimientoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TipoMovimientoRepository extends JpaRepository<TipoMovimientoEntity, Long> {

    Optional<TipoMovimientoEntity> findByNombreIgnoreCase(String nombre);
}
