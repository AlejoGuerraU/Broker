package com.broker.backend.controller;

import com.broker.backend.model.market.CreateOrderRequest;
import com.broker.backend.model.market.CreateOrderResponse;
import com.broker.backend.model.market.UpdateOrderRequest;
import com.broker.backend.model.portafolio.PortfolioAccountSummaryResponse;
import com.broker.backend.model.portafolio.PortfolioOrderResponse;
import com.broker.backend.model.portafolio.PortfolioPositionResponse;
import com.broker.backend.service.PortfolioService;
import com.broker.backend.service.TradingService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/portafolio")
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final TradingService tradingService;

    public PortfolioController(PortfolioService portfolioService, TradingService tradingService) {
        this.portfolioService = portfolioService;
        this.tradingService = tradingService;
    }

    @GetMapping("/positions")
    public List<PortfolioPositionResponse> getPositions(@AuthenticationPrincipal String userEmail) {
        return portfolioService.getPositions(userEmail);
    }

    @GetMapping("/orders")
    public List<PortfolioOrderResponse> getOrders(@AuthenticationPrincipal String userEmail) {
        return portfolioService.getOrders(userEmail);
    }

    @GetMapping("/summary")
    public PortfolioAccountSummaryResponse getAccountSummary(@AuthenticationPrincipal String userEmail) {
        return portfolioService.getAccountSummary(userEmail);
    }

    @PostMapping("/orders")
    public CreateOrderResponse createOrder(
            @AuthenticationPrincipal String userEmail,
            @Valid @RequestBody CreateOrderRequest request
    ) {
        return tradingService.createOrder(userEmail, request);
    }

    @PutMapping("/orders/{orderId}")
    public CreateOrderResponse updatePendingOrder(
            @AuthenticationPrincipal String userEmail,
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderRequest request
    ) {
        return tradingService.updatePendingOrder(userEmail, orderId, request);
    }

    @DeleteMapping("/orders/{orderId}")
    public CreateOrderResponse cancelPendingOrder(
            @AuthenticationPrincipal String userEmail,
            @PathVariable Long orderId
    ) {
        return tradingService.cancelPendingOrder(userEmail, orderId);
    }
}
