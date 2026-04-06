package com.broker.backend.service;

import com.broker.backend.model.market.MarketStockResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarketService {

    public List<MarketStockResponse> getMostActiveStocks() {
        return List.of(
                new MarketStockResponse(1L, "Apple", "AAPL", "$214.32", 1.84, "189.2M", "A", "bg-[#E8EEF9] text-[#1C2430]"),
                new MarketStockResponse(2L, "NVIDIA", "NVDA", "$942.67", 3.12, "244.8M", "N", "bg-[#DFF7D8] text-[#1F5F27]"),
                new MarketStockResponse(3L, "Tesla", "TSLA", "$176.45", -2.41, "132.4M", "T", "bg-[#FFE3E2] text-[#8A1F1D]"),
                new MarketStockResponse(4L, "Amazon", "AMZN", "$182.90", 0.96, "71.9M", "AM", "bg-[#FFF1D6] text-[#8A5B07]"),
                new MarketStockResponse(5L, "Microsoft", "MSFT", "$428.11", 1.27, "39.5M", "M", "bg-[#DDEBFF] text-[#12438B]"),
                new MarketStockResponse(6L, "Meta", "META", "$503.74", -0.68, "26.1M", "ME", "bg-[#E7E0FF] text-[#4D2CA3]")
        );
    }
}
