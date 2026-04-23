package com.broker.backend.service;

import com.broker.backend.exception.ResourceNotFoundException;
import com.broker.backend.persistence.entity.CuentaGestorEntity;
import com.broker.backend.persistence.entity.EstadoCuentaEntity;
import com.broker.backend.persistence.entity.PersonaEntity;
import com.broker.backend.persistence.repository.CuentaGestorRepository;
import com.broker.backend.persistence.repository.EstadoCuentaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Transactional
public class DefaultCuentaGestorService {

    private final CuentaGestorRepository cuentaGestorRepository;
    private final EstadoCuentaRepository estadoCuentaRepository;
    private final PersonaService personaService;

    public DefaultCuentaGestorService(
            CuentaGestorRepository cuentaGestorRepository,
            EstadoCuentaRepository estadoCuentaRepository,
            PersonaService personaService
    ) {
        this.cuentaGestorRepository = cuentaGestorRepository;
        this.estadoCuentaRepository = estadoCuentaRepository;
        this.personaService = personaService;
    }

    public CuentaGestorEntity getOrCreateDefaultCuentaGestor() {
        return getOrCreateCuentaGestorForUser(PersonaService.DEFAULT_EMAIL);
    }

    public CuentaGestorEntity getOrCreateCuentaGestorForUser(String email) {
        PersonaEntity persona = PersonaService.DEFAULT_EMAIL.equals(email)
                ? personaService.getOrCreateDemoPersona()
                : personaService.getOrCreateByEmail(email);

        return cuentaGestorRepository.findByPersonaId(persona.getId())
                .orElseGet(() -> createDefaultCuentaGestor(persona));
    }

    private CuentaGestorEntity createDefaultCuentaGestor(PersonaEntity persona) {
        EstadoCuentaEntity estadoCuenta = estadoCuentaRepository.findByNombreIgnoreCase("activa")
                .orElseThrow(() -> new ResourceNotFoundException("No existe el estado de cuenta activa en la base de datos"));

        CuentaGestorEntity cuentaGestor = new CuentaGestorEntity();
        cuentaGestor.setPersona(persona);
        cuentaGestor.setEstadoCuenta(estadoCuenta);
        cuentaGestor.setSaldo(BigDecimal.ZERO);
        return cuentaGestorRepository.save(cuentaGestor);
    }
}
