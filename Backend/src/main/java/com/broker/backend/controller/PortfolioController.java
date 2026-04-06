package com.broker.backend.controller;

import com.broker.backend.model.portafolio.PortfolioOrderResponse;
import com.broker.backend.model.portafolio.PortfolioPositionResponse;
import com.broker.backend.service.PortfolioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/portafolio")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("/positions")
    public List<PortfolioPositionResponse> getPositions() {
        return portfolioService.getPositions();
    }

    @GetMapping("/orders")
    public List<PortfolioOrderResponse> getOrders() {
        return portfolioService.getOrders();
    }
}
