package com.broker.backend.model.market;

public record CreateOrderResponse(
        Long id,
        String simbolo,
        String tipoOperacion,
        String tipoOrden,
        String estado,
        Double cantidad,
        Double precioReferencia,
        Double precioEjecucion,
        Double valorTotal,
        Double saldoDisponible,
        Double saldoCongelado,
        String mensaje
) {
}
