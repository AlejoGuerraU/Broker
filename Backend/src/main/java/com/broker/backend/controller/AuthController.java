package com.broker.backend.controller;

import com.broker.backend.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/google")
    public AuthService.AuthResponse authenticateWithGoogle(@Valid @RequestBody GoogleAuthRequest request) {
        return authService.authenticateWithGoogle(request.idToken());
    }

    public record GoogleAuthRequest(
            @NotBlank(message = "El Token ID de Google es obligatorio")
            String idToken
    ) {
    }
}
