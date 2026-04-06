package com.broker.backend.model.movimiento;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateMovimientoRequest(
        @NotBlank(message = "La descripcion es obligatoria")
        String description,
        @NotBlank(message = "La categoria es obligatoria")
        String category_name,
        @NotBlank(message = "La fecha es obligatoria")
        String movement_date,
        @NotNull(message = "El monto es obligatorio")
        @DecimalMin(value = "0.01", message = "El monto debe ser mayor a cero")
        Double amount,
        @NotNull(message = "El tipo es obligatorio")
        MovimientoType movement_type
) {
}
