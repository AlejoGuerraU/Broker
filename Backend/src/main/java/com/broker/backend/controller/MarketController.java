package com.broker.backend.controller;

import com.broker.backend.model.market.MarketAssetDetailResponse;
import com.broker.backend.model.market.MarketAssetPriceHistoryResponse;
import com.broker.backend.model.market.MarketDataStatusResponse;
import com.broker.backend.model.market.MarketFundamentalAnalysisResponse;
import com.broker.backend.model.market.MarketStockResponse;
import com.broker.backend.service.FundamentalAnalysisService;
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
    private final FundamentalAnalysisService fundamentalAnalysisService;

    public MarketController(
            MarketService marketService,
            FundamentalAnalysisService fundamentalAnalysisService
    ) {
        this.marketService = marketService;
        this.fundamentalAnalysisService = fundamentalAnalysisService;
    }

    @GetMapping("/most-active")
    public MostActiveResponse getMostActive() {
        return new MostActiveResponse(marketService.getMostActiveStocks());
    }

    @GetMapping("/assets/{symbol}")
    public MarketAssetDetailResponse getAssetDetail(@PathVariable("symbol") String symbol) {
        return marketService.getAssetDetail(symbol);
    }

    @GetMapping("/assets/{symbol}/history")
    public MarketAssetPriceHistoryResponse getAssetPriceHistory(@PathVariable("symbol") String symbol) {
        return marketService.getAssetPriceHistory(symbol);
    }

    @GetMapping("/assets/{symbol}/fundamentals")
    public MarketFundamentalAnalysisResponse getFundamentalAnalysis(@PathVariable("symbol") String symbol) {
        return fundamentalAnalysisService.getFundamentalAnalysis(symbol);
    }

    @GetMapping("/status")
    public MarketDataStatusResponse getMarketStatus() {
        return marketService.getMarketDataStatus();
    }

    public record MostActiveResponse(List<MarketStockResponse> items) {
    }
}
