package com.chaima.fxtrading.entity;

import com.chaima.fxtrading.model.OrderSide;
import com.chaima.fxtrading.model.OrderStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

import java.math.BigDecimal;

@Entity
@Table(name = "orders")
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String symbol;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderSide side;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal quantity;

    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column
    private LocalDateTime createdAt;

    protected OrderEntity() {
    }

    public OrderEntity(
            String symbol,
            OrderSide side,
            BigDecimal quantity,
            BigDecimal price,
            OrderStatus status
    ) {
        this.symbol = symbol;
        this.side = side;
        this.quantity = quantity;
        this.price = price;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public String getSymbol() {
        return symbol;
    }

    public OrderSide getSide() {
        return side;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public void fill() {
        if (status != OrderStatus.NEW) {
            throw new IllegalStateException("Only NEW orders can be filled");
        }

        this.status = OrderStatus.FILLED;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

}
