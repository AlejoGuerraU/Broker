package com.broker.backend.controller;

import com.broker.backend.model.market.MarketAssetDetailResponse;
import com.broker.backend.model.market.MarketDataStatusResponse;
import com.broker.backend.model.market.MarketStockResponse;
import com.broker.backend.service.MarketService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    @GetMapping("/assets/{symbol}")
    public MarketAssetDetailResponse getAssetDetail(@PathVariable("symbol") String symbol) {
        return marketService.getAssetDetail(symbol);
    }

    @GetMapping("/status")
    public MarketDataStatusResponse getMarketStatus() {
        return marketService.getMarketDataStatus();
    }

    public record MostActiveResponse(List<MarketStockResponse> items) {
    }
}
