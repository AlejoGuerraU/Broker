package com.broker.backend.persistence.repository;

import com.broker.backend.persistence.entity.CategoriaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<CategoriaEntity, Long> {

    Optional<CategoriaEntity> findByTipoMovimientoIdAndNombreIgnoreCase(Long tipoMovimientoId, String nombre);
}
