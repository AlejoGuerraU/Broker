package com.broker.backend.controller;

import com.broker.backend.model.market.MarketStockResponse;
import com.broker.backend.service.MarketService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    private final MarketService marketService;

    public MarketController(MarketService marketService) {
        this.marketService = marketService;
    }

    @GetMapping("/most-active")
    public MostActiveResponse getMostActive() {
        return new MostActiveResponse(marketService.getMostActiveStocks());
    }

    public record MostActiveResponse(List<MarketStockResponse> items) {
    }
}
