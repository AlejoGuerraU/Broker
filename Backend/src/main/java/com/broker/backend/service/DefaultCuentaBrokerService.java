package com.broker.backend.service;

import com.broker.backend.exception.ResourceNotFoundException;
import com.broker.backend.persistence.entity.CuentaBrokerEntity;
import com.broker.backend.persistence.entity.EstadoCuentaEntity;
import com.broker.backend.persistence.entity.PersonaEntity;
import com.broker.backend.persistence.repository.CuentaBrokerRepository;
import com.broker.backend.persistence.repository.EstadoCuentaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Transactional
public class DefaultCuentaBrokerService {

    private final CuentaBrokerRepository cuentaBrokerRepository;
    private final EstadoCuentaRepository estadoCuentaRepository;
    private final PersonaService personaService;

    public DefaultCuentaBrokerService(
            CuentaBrokerRepository cuentaBrokerRepository,
            EstadoCuentaRepository estadoCuentaRepository,
            PersonaService personaService
    ) {
        this.cuentaBrokerRepository = cuentaBrokerRepository;
        this.estadoCuentaRepository = estadoCuentaRepository;
        this.personaService = personaService;
    }

    public CuentaBrokerEntity getOrCreateDefaultCuentaBroker() {
        return getOrCreateCuentaBrokerForUser(PersonaService.DEFAULT_EMAIL);
    }

    public CuentaBrokerEntity getOrCreateCuentaBrokerForUser(String email) {
        PersonaEntity persona = PersonaService.DEFAULT_EMAIL.equals(email) 
                ? personaService.getOrCreateDemoPersona() 
                : personaService.getByEmail(email);

        return cuentaBrokerRepository.findByPersonaIdAndTipoCuenta(persona.getId(), CuentaBrokerEntity.TipoCuenta.demo)
                .orElseGet(() -> createDefaultCuentaBroker(persona));
    }

    private CuentaBrokerEntity createDefaultCuentaBroker(PersonaEntity persona) {
        EstadoCuentaEntity estadoCuenta = estadoCuentaRepository.findByNombreIgnoreCase("activa")
                .orElseThrow(() -> new ResourceNotFoundException("No existe el estado de cuenta activa en la base de datos"));

        CuentaBrokerEntity cuentaBroker = new CuentaBrokerEntity();
        cuentaBroker.setPersona(persona);
        cuentaBroker.setTipoCuenta(CuentaBrokerEntity.TipoCuenta.demo);
        cuentaBroker.setSaldoDisponible(new BigDecimal("30000000.00"));
        cuentaBroker.setSaldoCongelado(BigDecimal.ZERO);
        cuentaBroker.setSaldoInicialDemo(new BigDecimal("30000000.00"));
        cuentaBroker.setEstadoCuenta(estadoCuenta);
        return cuentaBrokerRepository.save(cuentaBroker);
    }
}
