package com.broker.backend.service;

import com.broker.backend.config.JwtProvider;
import com.broker.backend.exception.BusinessException;
import com.broker.backend.persistence.entity.PersonaEntity;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Map;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthService.class);

    private final GoogleIdTokenVerifier verifier;
    private final PersonaService personaService;
    private final DefaultCuentaBrokerService defaultCuentaBrokerService;
    private final DefaultCuentaGestorService defaultCuentaGestorService;
    private final JwtProvider jwtProvider;

    public AuthService(
            @Value("${google.client-id}") String clientId,
            PersonaService personaService,
            DefaultCuentaBrokerService defaultCuentaBrokerService,
            DefaultCuentaGestorService defaultCuentaGestorService,
            JwtProvider jwtProvider
    ) {
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(clientId))
                .build();
        this.personaService = personaService;
        this.defaultCuentaBrokerService = defaultCuentaBrokerService;
        this.defaultCuentaGestorService = defaultCuentaGestorService;
        this.jwtProvider = jwtProvider;
    }

    public AuthResponse authenticateWithGoogle(String idTokenString) {
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new BusinessException("Token de Google invalido");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String googleSub = payload.getSubject();

            // Sincronizar usuario
            PersonaEntity persona = personaService.getOrCreateByGoogle(googleSub, email, name);
            LOGGER.info("Usuario autenticado: {} ({})", persona.getNombre(), persona.getCorreo());
            
            // Asegurar que tiene cuentas (demo broker con 30M y gestor con 0)
            defaultCuentaBrokerService.getOrCreateCuentaBrokerForUser(persona.getCorreo());
            defaultCuentaGestorService.getOrCreateCuentaGestorForUser(persona.getCorreo());

            // Generar JWT propio
            String token = jwtProvider.generateToken(persona.getCorreo());
            LOGGER.info("JWT generado exitosamente para {}", persona.getCorreo());

            return new AuthResponse(token, persona.getNombre(), persona.getCorreo());

        } catch (GeneralSecurityException | IOException e) {
            LOGGER.error("Error validando token de Google: {}", e.getMessage(), e);
            throw new BusinessException("Error al procesar la autenticacion con Google");
        } catch (IllegalArgumentException e) {
            LOGGER.warn("Token de Google con formato invalido: {}", e.getMessage());
            throw new BusinessException("El token de Google recibido tiene un formato invalido");
        }
    }

    public record AuthResponse(String token, String nombre, String correo) {
    }
}
