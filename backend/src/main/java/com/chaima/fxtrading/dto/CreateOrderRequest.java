package com.chaima.fxtrading.dto;

import com.chaima.fxtrading.model.OrderSide;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateOrderRequest(
        @NotBlank String symbol,
        @NotNull OrderSide side,
        @NotNull @DecimalMin(value = "0.01") BigDecimal quantity
) {
}
