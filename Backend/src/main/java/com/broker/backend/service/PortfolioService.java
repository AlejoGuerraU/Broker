package com.broker.backend.service;

import com.broker.backend.model.portafolio.OrderStatus;
import com.broker.backend.model.portafolio.OrderType;
import com.broker.backend.model.portafolio.PortfolioOrderResponse;
import com.broker.backend.model.portafolio.PortfolioPositionResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PortfolioService {

    public List<PortfolioPositionResponse> getPositions() {
        return List.of(
                new PortfolioPositionResponse(1L, "AAPL", "Apple Inc.", "Tecnologia", 12, 182.35, 196.42, 1.26),
                new PortfolioPositionResponse(2L, "MSFT", "Microsoft Corp.", "Tecnologia", 8, 401.2, 417.8, 0.84),
                new PortfolioPositionResponse(3L, "KO", "Coca-Cola Co.", "Consumo", 20, 58.1, 56.92, -0.63),
                new PortfolioPositionResponse(4L, "JPM", "JPMorgan Chase", "Financiero", 10, 191.7, 198.55, 0.47)
        );
    }

    public List<PortfolioOrderResponse> getOrders() {
        return List.of(
                new PortfolioOrderResponse(1L, "2026-03-21", "AAPL", OrderType.buy, 4, 191.5, OrderStatus.filled),
                new PortfolioOrderResponse(2L, "2026-03-24", "MSFT", OrderType.buy, 2, 412.2, OrderStatus.filled),
                new PortfolioOrderResponse(3L, "2026-03-28", "KO", OrderType.sell, 5, 57.4, OrderStatus.pending),
                new PortfolioOrderResponse(4L, "2026-03-30", "JPM", OrderType.buy, 3, 197.1, OrderStatus.cancelled)
        );
    }
}
