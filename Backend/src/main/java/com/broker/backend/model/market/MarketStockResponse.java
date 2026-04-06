package com.broker.backend.model.market;

public record MarketStockResponse(
        Long id,
        String nombre,
        String simbolo,
        String precio,
        Double variacion,
        String volumen,
        String logoTexto,
        String logoClase
) {
}
