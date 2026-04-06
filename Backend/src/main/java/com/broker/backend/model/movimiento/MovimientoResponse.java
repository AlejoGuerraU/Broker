package com.broker.backend.model.movimiento;

public record MovimientoResponse(
        Long id,
        String description,
        String category_name,
        String movement_date,
        Double amount,
        MovimientoType movement_type
) {
}
