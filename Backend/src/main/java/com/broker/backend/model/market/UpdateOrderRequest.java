package com.broker.backend.model.market;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record UpdateOrderRequest(
        @NotNull(message = "La cantidad es obligatoria")
        @DecimalMin(value = "0.0001", inclusive = true, message = "La cantidad debe ser mayor a cero")
        BigDecimal cantidad,

        BigDecimal precioLimite
) {
}
