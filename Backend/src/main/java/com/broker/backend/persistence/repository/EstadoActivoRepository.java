package com.broker.backend.persistence.repository;

import com.broker.backend.persistence.entity.EstadoActivoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EstadoActivoRepository extends JpaRepository<EstadoActivoEntity, Long> {

    Optional<EstadoActivoEntity> findByNombreIgnoreCase(String nombre);
}
