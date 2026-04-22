package com.broker.backend.service;

import com.broker.backend.exception.ResourceNotFoundException;
import com.broker.backend.persistence.entity.PersonaEntity;
import com.broker.backend.persistence.entity.TipoDocumentoEntity;
import com.broker.backend.persistence.repository.PersonaRepository;
import com.broker.backend.persistence.repository.TipoDocumentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DemoPersonaService {

    public static final String DEFAULT_EMAIL = "demo@broker.local";

    private final PersonaRepository personaRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;

    public DemoPersonaService(
            PersonaRepository personaRepository,
            TipoDocumentoRepository tipoDocumentoRepository
    ) {
        this.personaRepository = personaRepository;
        this.tipoDocumentoRepository = tipoDocumentoRepository;
    }

    public PersonaEntity getOrCreateDemoPersona() {
        TipoDocumentoEntity tipoDocumento = tipoDocumentoRepository.findByNombreIgnoreCase("CC")
                .orElseThrow(() -> new ResourceNotFoundException("No existe el tipo de documento CC en la base de datos"));

        return personaRepository.findByCorreoIgnoreCase(DEFAULT_EMAIL)
                .orElseGet(() -> createDemoPersona(tipoDocumento));
    }

    private PersonaEntity createDemoPersona(TipoDocumentoEntity tipoDocumento) {
        PersonaEntity persona = new PersonaEntity();
        persona.setNombre("Usuario Demo Broker");
        persona.setCorreo(DEFAULT_EMAIL);
        persona.setNumeroTelefonico("3000000000");
        persona.setTipoDocumento(tipoDocumento);
        persona.setNumeroDocumento("1000000000");
        return personaRepository.save(persona);
    }
}
