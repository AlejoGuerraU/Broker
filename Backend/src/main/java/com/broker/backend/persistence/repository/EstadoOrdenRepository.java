package com.broker.backend.persistence.repository;

import com.broker.backend.persistence.entity.EstadoOrdenEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EstadoOrdenRepository extends JpaRepository<EstadoOrdenEntity, Long> {

    Optional<EstadoOrdenEntity> findByNombreIgnoreCase(String nombre);
}
