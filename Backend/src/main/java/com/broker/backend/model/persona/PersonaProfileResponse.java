package com.broker.backend.model.persona;

public record PersonaProfileResponse(
        Long id,
        String nombre,
        String correo,
        String telefono
) {
}
