package com.broker.backend.persistence.repository;

import com.broker.backend.persistence.entity.PersonaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PersonaRepository extends JpaRepository<PersonaEntity, Long> {

    Optional<PersonaEntity> findByCorreoIgnoreCase(String correo);

    Optional<PersonaEntity> findByGoogleSub(String googleSub);
}
