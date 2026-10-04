package com.chaima.fxtrading.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record Order(
        String id,
        String symbol,
        OrderSide side,
        BigDecimal quantity,
        BigDecimal price,
        OrderStatus status,
        LocalDateTime createdAt
) {
}