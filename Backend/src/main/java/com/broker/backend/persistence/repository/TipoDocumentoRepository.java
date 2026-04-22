package com.broker.backend.persistence.repository;

import com.broker.backend.persistence.entity.TipoDocumentoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TipoDocumentoRepository extends JpaRepository<TipoDocumentoEntity, Long> {

    Optional<TipoDocumentoEntity> findByNombreIgnoreCase(String nombre);
}
