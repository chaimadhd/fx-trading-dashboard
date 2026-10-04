package com.chaima.fxtrading.service;

import com.chaima.fxtrading.entity.OrderEntity;
import com.chaima.fxtrading.model.MarketPrice;
import com.chaima.fxtrading.model.Order;
import com.chaima.fxtrading.model.OrderSide;
import com.chaima.fxtrading.model.OrderStatus;
import com.chaima.fxtrading.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class OrderService {

    private final MarketService marketService;
    private final OrderRepository orderRepository;

    public OrderService(
            MarketService marketService,
            OrderRepository orderRepository
    ) {
        this.marketService = marketService;
        this.orderRepository = orderRepository;
    }

    public Order createOrder(
            String symbol,
            OrderSide side,
            BigDecimal quantity
    ) {

        MarketPrice marketPrice = marketService.getMarketPrices()
                .stream()
                .filter(price -> price.symbol().equals(symbol))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Market price not found for symbol: " + symbol
                ));

        BigDecimal executionPrice = side == OrderSide.BUY
                ? marketPrice.ask()
                : marketPrice.bid();

        OrderEntity entity = new OrderEntity(
                symbol,
                side,
                quantity,
                executionPrice,
                OrderStatus.NEW
        );

        OrderEntity savedOrder = orderRepository.save(entity);

        return new Order(
                savedOrder.getId(),
                savedOrder.getSymbol(),
                savedOrder.getSide(),
                savedOrder.getQuantity(),
                savedOrder.getPrice(),
                savedOrder.getStatus(),
                savedOrder.getCreatedAt()
        );
    }

        public Order cancelOrder(String orderId) {
    OrderEntity order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException(
                    "Order not found: " + orderId
            ));

    if (order.getStatus() == OrderStatus.CANCELLED) {
        throw new IllegalStateException("Order is already cancelled");
    }

    if (order.getStatus() == OrderStatus.FILLED) {
        throw new IllegalStateException("Filled orders cannot be cancelled");
    }

    order.setStatus(OrderStatus.CANCELLED);

    OrderEntity savedOrder = orderRepository.save(order);

    return new Order(
            savedOrder.getId(),
            savedOrder.getSymbol(),
            savedOrder.getSide(),
            savedOrder.getQuantity(),
            savedOrder.getPrice(),
            savedOrder.getStatus(),
            savedOrder.getCreatedAt()
    );
}


        public Order fillOrder(String orderId) {
                OrderEntity order = orderRepository.findById(orderId)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Order not found: " + orderId
                        ));

                order.fill();

                OrderEntity savedOrder = orderRepository.save(order);

                return new Order(
                        savedOrder.getId(),
                        savedOrder.getSymbol(),
                        savedOrder.getSide(),
                        savedOrder.getQuantity(),
                        savedOrder.getPrice(),
                        savedOrder.getStatus(),
                        savedOrder.getCreatedAt()
                );
        }

	public java.util.List<Order> getOrders() {
	    return orderRepository.findAll()
            .stream()
            .map(order -> new Order(
                    order.getId(),
                    order.getSymbol(),
                    order.getSide(),
                    order.getQuantity(),
                    order.getPrice(),
                    order.getStatus(),
                    order.getCreatedAt()
            ))
            .toList();
	}
}
