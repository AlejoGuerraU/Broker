package com.broker.backend.persistence.repository;

import com.broker.backend.persistence.entity.TipoActivoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TipoActivoRepository extends JpaRepository<TipoActivoEntity, Long> {

    Optional<TipoActivoEntity> findByNombreIgnoreCase(String nombre);
}
