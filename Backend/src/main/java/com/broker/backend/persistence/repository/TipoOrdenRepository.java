package com.broker.backend.persistence.repository;

import com.broker.backend.persistence.entity.TipoOrdenEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TipoOrdenRepository extends JpaRepository<TipoOrdenEntity, Long> {

    Optional<TipoOrdenEntity> findByNombreIgnoreCase(String nombre);
}
