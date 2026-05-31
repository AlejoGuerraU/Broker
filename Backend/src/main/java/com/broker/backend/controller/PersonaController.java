package com.broker.backend.controller;

import com.broker.backend.model.persona.PersonaProfileResponse;
import com.broker.backend.model.persona.UpdatePersonaProfileRequest;
import com.broker.backend.service.PersonaService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/personas")
public class PersonaController {

    private final PersonaService personaService;

    public PersonaController(PersonaService personaService) {
        this.personaService = personaService;
    }

    @GetMapping("/me")
    public PersonaProfileResponse getCurrentPersona(@AuthenticationPrincipal String userEmail) {
        return personaService.getProfile(userEmail);
    }

    @PutMapping("/me")
    public PersonaProfileResponse updateCurrentPersona(
            @AuthenticationPrincipal String userEmail,
            @Valid @RequestBody UpdatePersonaProfileRequest request
    ) {
        return personaService.updateProfile(userEmail, request);
    }
}
