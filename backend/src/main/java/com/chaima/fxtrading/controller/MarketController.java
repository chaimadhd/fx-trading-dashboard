package com.chaima.fxtrading.controller;

import com.chaima.fxtrading.model.MarketPrice;
import com.chaima.fxtrading.service.MarketService;
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

    @GetMapping
    public List<MarketPrice> getMarket() {
        return marketService.getMarketPrices();
    }
}
