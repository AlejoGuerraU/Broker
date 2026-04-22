package com.broker.backend.persistence.repository;

import com.broker.backend.persistence.entity.HistorialPrecioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface HistorialPrecioRepository extends JpaRepository<HistorialPrecioEntity, Long> {

    List<HistorialPrecioEntity> findTop2ByActivoIdOrderByFechaDesc(Long activoId);

    Optional<HistorialPrecioEntity> findByActivoIdAndFecha(Long activoId, LocalDateTime fecha);
}
