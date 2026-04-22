package com.broker.backend.model.market;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateOrderRequest(
        @NotBlank(message = "El simbolo es obligatorio")
        String simbolo,

        @NotBlank(message = "El tipo de operacion es obligatorio")
        String tipoOperacion,

        @NotNull(message = "La cantidad es obligatoria")
        @DecimalMin(value = "0.0001", inclusive = true, message = "La cantidad debe ser mayor a cero")
        BigDecimal cantidad,

        String tipoOrden,
        BigDecimal precioLimite
) {
}
