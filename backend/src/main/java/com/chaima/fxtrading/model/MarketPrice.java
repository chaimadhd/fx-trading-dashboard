package com.chaima.fxtrading.model;

import java.math.BigDecimal;

public record MarketPrice(
        String symbol,
        BigDecimal bid,
        BigDecimal ask,
        BigDecimal spread
) {
}
