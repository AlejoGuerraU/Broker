package com.broker.backend.model.portafolio;

public record PortfolioPositionResponse(
        Long id,
        String symbol,
        String company_name,
        String sector_name,
        Integer quantity,
        Double average_price,
        Double current_price,
        Double daily_change_percent
) {
}
