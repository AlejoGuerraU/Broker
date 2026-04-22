package com.broker.backend.persistence.repository;

import com.broker.backend.persistence.entity.TipoOperacionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TipoOperacionRepository extends JpaRepository<TipoOperacionEntity, Long> {

    Optional<TipoOperacionEntity> findByNombreIgnoreCase(String nombre);
}
