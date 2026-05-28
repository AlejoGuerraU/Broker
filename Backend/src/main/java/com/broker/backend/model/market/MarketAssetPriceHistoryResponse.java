package com.broker.backend.model.market;

import java.util.List;

public record MarketAssetPriceHistoryResponse(
        Long activoId,
        String simbolo,
        String moneda,
        List<MarketAssetPricePointResponse> puntos
) {
}
