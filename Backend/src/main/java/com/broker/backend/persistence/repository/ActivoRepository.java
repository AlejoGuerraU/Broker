package com.broker.backend.persistence.repository;

import com.broker.backend.persistence.entity.ActivoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ActivoRepository extends JpaRepository<ActivoEntity, Long> {

    Optional<ActivoEntity> findBySimboloIgnoreCase(String simbolo);

    List<ActivoEntity> findAllByOrderBySimboloAsc();
}
