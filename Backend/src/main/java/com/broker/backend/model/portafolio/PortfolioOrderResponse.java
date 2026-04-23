package com.broker.backend.model.portafolio;

public record PortfolioOrderResponse(
        Long id,
        String created_at,
        String asset_symbol,
        OrderType order_type,
        String order_style,
        Double quantity,
        Double unit_price,
        OrderStatus status
) {
}
