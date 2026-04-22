package com.broker.backend.model.market;

public record MarketAssetDetailResponse(
        Long id,
        String nombre,
        String simbolo,
        Double precioActual,
        Double variacionDiaria,
        String volumen,
        String mercado,
        String moneda
) {
}
