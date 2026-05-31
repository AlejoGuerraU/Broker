package com.broker.backend.model.persona;

import jakarta.validation.constraints.Size;

public record UpdatePersonaProfileRequest(
        @Size(max = 30, message = "El numero telefonico no puede superar 30 caracteres")
        String telefono
) {
}
