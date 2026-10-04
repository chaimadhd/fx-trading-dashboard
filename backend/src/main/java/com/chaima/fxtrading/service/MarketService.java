package com.chaima.fxtrading.service;

import com.chaima.fxtrading.model.MarketPrice;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class MarketService {

    public List<MarketPrice> getMarketPrices() {
        return List.of(
                createMarketPrice("EUR/USD", "1.1725", "1.1727"),
                createMarketPrice("GBP/USD", "1.3451", "1.3454"),
                createMarketPrice("USD/JPY", "147.82", "147.85")
        );
    }

    private MarketPrice createMarketPrice(String symbol, String bidValue, String askValue) {
        BigDecimal bid = new BigDecimal(bidValue);
        BigDecimal ask = new BigDecimal(askValue);
        BigDecimal spread = ask.subtract(bid);

        return new MarketPrice(symbol, bid, ask, spread);
    }
}
