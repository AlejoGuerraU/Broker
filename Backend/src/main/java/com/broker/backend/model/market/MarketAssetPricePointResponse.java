package com.broker.backend.model.market;

import java.time.LocalDateTime;

public record MarketAssetPricePointResponse(
        LocalDateTime fecha,
        Double apertura,
        Double maximo,
        Double minimo,
        Double cierre
) {
}
