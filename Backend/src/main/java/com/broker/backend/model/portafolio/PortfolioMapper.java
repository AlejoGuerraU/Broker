package com.broker.backend.model.portafolio;

import com.broker.backend.persistence.entity.HistorialPrecioEntity;
import com.broker.backend.persistence.entity.OrdenEntity;
import com.broker.backend.persistence.entity.PosicionEntity;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Component
public class PortfolioMapper {

    public PortfolioPositionResponse toPositionResponse(PosicionEntity posicion, List<HistorialPrecioEntity> latestPrices) {
        return new PortfolioPositionResponse(
                posicion.getId(),
                posicion.getActivo().getSimbolo(),
                posicion.getActivo().getNombre(),
                resolveSectorName(posicion),
                posicion.getCantidad().intValue(),
                posicion.getPrecioPromedio().doubleValue(),
                posicion.getActivo().getPrecioActual().doubleValue(),
                calculateDailyChangePercent(latestPrices)
        );
    }

    public PortfolioOrderResponse toOrderResponse(OrdenEntity orden) {
        return new PortfolioOrderResponse(
                orden.getId(),
                orden.getFechaCreacion().toLocalDate().toString(),
                orden.getActivo().getSimbolo(),
                mapOrderType(orden.getTipoOperacion().getNombre()),
                orden.getTipoOrden().getNombre(),
                orden.getCantidad().doubleValue(),
                resolveUnitPrice(orden).doubleValue(),
                mapOrderStatus(orden.getEstadoOrden().getNombre())
        );
    }

    private String resolveSectorName(PosicionEntity posicion) {
        String market = posicion.getActivo().getMercado();
        if (market != null && !market.isBlank()) {
            return market;
        }

        return posicion.getActivo().getTipoActivo().getNombre();
    }

    private double calculateDailyChangePercent(List<HistorialPrecioEntity> latestPrices) {
        if (latestPrices.size() < 2) {
            return 0.0;
        }

        BigDecimal current = latestPrices.get(0).getPrecioCierre();
        BigDecimal previous = latestPrices.get(1).getPrecioCierre();

        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }

        return current.subtract(previous)
                .multiply(BigDecimal.valueOf(100))
                .divide(previous, 2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private BigDecimal resolveUnitPrice(OrdenEntity orden) {
        return orden.getPrecioEjecucion() != null ? orden.getPrecioEjecucion() : orden.getPrecioReferencia();
    }

    private OrderType mapOrderType(String operationType) {
        return "compra".equalsIgnoreCase(operationType) ? OrderType.buy : OrderType.sell;
    }

    private OrderStatus mapOrderStatus(String status) {
        if ("ejecutada".equalsIgnoreCase(status)) {
            return OrderStatus.filled;
        }

        if ("pendiente".equalsIgnoreCase(status)) {
            return OrderStatus.pending;
        }

        if ("rechazada".equalsIgnoreCase(status)) {
            return OrderStatus.rejected;
        }

        return OrderStatus.cancelled;
    }
}
