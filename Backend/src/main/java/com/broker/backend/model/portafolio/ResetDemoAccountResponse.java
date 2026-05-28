package com.broker.backend.model.portafolio;

public record ResetDemoAccountResponse(
        Double available_cash,
        Double frozen_cash,
        String last_reset_at,
        Integer deleted_orders,
        String message
) {
}
