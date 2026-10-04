package com.chaima.fxtrading.service;

import com.chaima.fxtrading.entity.OrderEntity;
import com.chaima.fxtrading.model.OrderSide;
import com.chaima.fxtrading.model.OrderStatus;
import com.chaima.fxtrading.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PortfolioService {

    private final OrderRepository orderRepository;

    public PortfolioService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public PortfolioSummary getPortfolioSummary() {

        List<OrderEntity> filledOrders = orderRepository.findAll()
                .stream()
                .filter(order -> order.getStatus() == OrderStatus.FILLED)
                .toList();

        BigDecimal buyValue = filledOrders.stream()
                .filter(order -> order.getSide() == OrderSide.BUY)
                .map(order -> order.getQuantity().multiply(order.getPrice()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal sellValue = filledOrders.stream()
                .filter(order -> order.getSide() == OrderSide.SELL)
                .map(order -> order.getQuantity().multiply(order.getPrice()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal buyQuantity = filledOrders.stream()
                .filter(order -> order.getSide() == OrderSide.BUY)
                .map(OrderEntity::getQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal sellQuantity = filledOrders.stream()
                .filter(order -> order.getSide() == OrderSide.SELL)
                .map(OrderEntity::getQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netPosition = buyQuantity.subtract(sellQuantity);

        BigDecimal realizedPnl = calculateRealizedPnl(filledOrders);

        return new PortfolioSummary(
                buyValue,
                sellValue,
                netPosition,
                realizedPnl,
                filledOrders.size()
        );
    }

    private BigDecimal calculateRealizedPnl(List<OrderEntity> orders) {

        BigDecimal realizedPnl = BigDecimal.ZERO;
        BigDecimal remainingBuyQuantity = BigDecimal.ZERO;
        BigDecimal averageBuyPrice = BigDecimal.ZERO;

        for (OrderEntity order : orders) {

            if (order.getSide() == OrderSide.BUY) {

                BigDecimal quantity = order.getQuantity();

                BigDecimal totalBuyCost =
                        averageBuyPrice.multiply(remainingBuyQuantity)
                                .add(order.getPrice().multiply(quantity));

                remainingBuyQuantity =
                        remainingBuyQuantity.add(quantity);

                averageBuyPrice = totalBuyCost.divide(
                        remainingBuyQuantity,
                        10,
                        java.math.RoundingMode.HALF_UP
                );
            }

            if (order.getSide() == OrderSide.SELL) {

                BigDecimal sellQuantity = order.getQuantity();

                BigDecimal matchedQuantity =
                        sellQuantity.min(remainingBuyQuantity);

                realizedPnl = realizedPnl.add(
                        order.getPrice()
                                .subtract(averageBuyPrice)
                                .multiply(matchedQuantity)
                );

                remainingBuyQuantity =
                        remainingBuyQuantity.subtract(matchedQuantity);
            }
        }

        return realizedPnl;
    }

    public record PortfolioSummary(
            BigDecimal buyValue,
            BigDecimal sellValue,
            BigDecimal netPosition,
            BigDecimal realizedPnl,
            int totalOrders
    ) {
    }
}