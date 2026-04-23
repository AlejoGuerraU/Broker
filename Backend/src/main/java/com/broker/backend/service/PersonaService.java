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
public class PersonaService {

    public static final String DEFAULT_EMAIL = "demo@broker.local";

    private final PersonaRepository personaRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;

    public PersonaService(
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
                .orElseGet(() -> createPersona(tipoDocumento, "Usuario Demo Broker", DEFAULT_EMAIL, "1000000000", null));
    }

    public PersonaEntity getByEmail(String email) {
        return personaRepository.findByCorreoIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("No existe una persona con el correo " + email));
    }

    public PersonaEntity getOrCreateByEmail(String email) {
        return personaRepository.findByCorreoIgnoreCase(email)
                .orElseGet(() -> {
                    TipoDocumentoEntity tipoDocumento = tipoDocumentoRepository.findByNombreIgnoreCase("CC")
                            .orElseThrow(() -> new ResourceNotFoundException("No existe el tipo de documento CC en la base de datos"));
                    String normalizedEmail = email == null ? DEFAULT_EMAIL : email.trim().toLowerCase();
                    String nombre = buildDefaultName(normalizedEmail);
                    String numeroDocumento = buildDefaultDocument(normalizedEmail);
                    return createPersona(tipoDocumento, nombre, normalizedEmail, numeroDocumento, null);
                });
    }

    public PersonaEntity getOrCreateByGoogle(String googleSub, String email, String nombre) {
        return personaRepository.findByGoogleSub(googleSub)
                .orElseGet(() -> {
                    // Si no existe por sub, buscamos por correo (por si el usuario ya existía de antes o por demo)
                    PersonaEntity persona = personaRepository.findByCorreoIgnoreCase(email)
                            .orElseGet(() -> {
                                TipoDocumentoEntity tipoDocumento = tipoDocumentoRepository.findByNombreIgnoreCase("CC")
                                        .orElseThrow(() -> new ResourceNotFoundException("No existe el tipo de documento CC en la base de datos"));
                                return createPersona(tipoDocumento, nombre, email, "G-" + googleSub.substring(0, 8), googleSub);
                            });
                    
                    // Si encontramos por correo pero no tenía el sub, se lo asignamos
                    if (persona.getGoogleSub() == null) {
                        persona.setGoogleSub(googleSub);
                        return personaRepository.save(persona);
                    }
                    return persona;
                });
    }

    private PersonaEntity createPersona(TipoDocumentoEntity tipoDocumento, String nombre, String email, String numeroDocumento, String googleSub) {
        PersonaEntity persona = new PersonaEntity();
        persona.setNombre(nombre);
        persona.setCorreo(email);
        persona.setGoogleSub(googleSub);
        persona.setNumeroTelefonico("3000000000"); // Valor por defecto
        persona.setTipoDocumento(tipoDocumento);
        persona.setNumeroDocumento(numeroDocumento);
        
        PersonaEntity saved = personaRepository.save(persona);
        return saved;
    }

    private String buildDefaultName(String email) {
        int separatorIndex = email.indexOf('@');
        String alias = separatorIndex > 0 ? email.substring(0, separatorIndex) : "broker";
        return "Usuario " + alias;
    }

    private String buildDefaultDocument(String email) {
        String digitsOnly = email.replaceAll("\\D", "");

        if (digitsOnly.length() >= 10) {
            return digitsOnly.substring(0, 10);
        }

        return String.format("%010d", Math.abs(email.hashCode()) % 1_000_000_000L);
    }
}
