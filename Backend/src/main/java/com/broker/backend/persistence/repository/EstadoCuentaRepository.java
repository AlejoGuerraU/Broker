package com.broker.backend.persistence.repository;

import com.broker.backend.persistence.entity.EstadoCuentaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EstadoCuentaRepository extends JpaRepository<EstadoCuentaEntity, Long> {

    Optional<EstadoCuentaEntity> findByNombreIgnoreCase(String nombre);
}
