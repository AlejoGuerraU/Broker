package com.broker.backend.persistence.repository;

import com.broker.backend.persistence.entity.AnalisisFundamentalAccionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnalisisFundamentalAccionRepository extends JpaRepository<AnalisisFundamentalAccionEntity, Long> {

    Optional<AnalisisFundamentalAccionEntity> findBySimboloIgnoreCase(String simbolo);
}
