package com.broker.backend.model.market;

public record MarketDataStatusResponse(
        String fuente,
        boolean apiKeyConfigurada,
        boolean alphaVantageDisponible,
        boolean mercadoAbierto,
        String zonaHorariaMercado,
        int activosPersistidos,
        String mensaje
) {
}
