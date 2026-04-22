package com.broker.backend.persistence.repository;

import com.broker.backend.persistence.entity.CuentaGestorEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CuentaGestorRepository extends JpaRepository<CuentaGestorEntity, Long> {

    Optional<CuentaGestorEntity> findByPersonaId(Long personaId);

    Optional<CuentaGestorEntity> findFirstByOrderByIdAsc();
}
