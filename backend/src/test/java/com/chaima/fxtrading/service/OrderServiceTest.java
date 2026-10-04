package com.chaima.fxtrading.service;

import com.chaima.fxtrading.model.Order;
import com.chaima.fxtrading.model.OrderSide;
import com.chaima.fxtrading.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import com.chaima.fxtrading.entity.OrderEntity;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class OrderServiceTest {

    private final MarketService marketService = new MarketService();
    private final OrderRepository orderRepository = mock(OrderRepository.class);

    private final OrderService orderService =
            new OrderService(marketService, orderRepository);

    @Test
    void shouldUseAskPriceForBuyOrder() {

	when(orderRepository.save(any(OrderEntity.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

        Order order = orderService.createOrder(
                "EUR/USD",
                OrderSide.BUY,
                new BigDecimal("10000")
        );

        assertEquals(new BigDecimal("1.1727"), order.price());
        assertEquals(OrderSide.BUY, order.side());
        assertEquals("EUR/USD", order.symbol());

        verify(orderRepository).save(any());
    }

    @Test
    void shouldUseBidPriceForSellOrder() {

	when(orderRepository.save(any(OrderEntity.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

        Order order = orderService.createOrder(
                "EUR/USD",
                OrderSide.SELL,
                new BigDecimal("10000")
        );

        assertEquals(new BigDecimal("1.1725"), order.price());
        assertEquals(OrderSide.SELL, order.side());
        assertEquals("EUR/USD", order.symbol());

        verify(orderRepository).save(any());
    }
}
