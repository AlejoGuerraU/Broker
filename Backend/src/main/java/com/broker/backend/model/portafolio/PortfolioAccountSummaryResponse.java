package com.broker.backend.model.portafolio;

public record PortfolioAccountSummaryResponse(
        Double available_cash,
        Double frozen_cash,
        String last_reset_at
) {
}
