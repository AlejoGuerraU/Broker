package com.broker.backend.persistence.repository;

import com.broker.backend.persistence.entity.CuentaBrokerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CuentaBrokerRepository extends JpaRepository<CuentaBrokerEntity, Long> {

    Optional<CuentaBrokerEntity> findByPersonaIdAndTipoCuenta(Long personaId, CuentaBrokerEntity.TipoCuenta tipoCuenta);
}
