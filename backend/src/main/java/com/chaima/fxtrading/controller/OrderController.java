package com.chaima.fxtrading.controller;

import com.chaima.fxtrading.dto.CreateOrderRequest;
import com.chaima.fxtrading.model.Order;
import com.chaima.fxtrading.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public Order createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return orderService.createOrder(
                request.symbol(),
                request.side(),
                request.quantity()
        );
    }

    @GetMapping
    public List<Order> getOrders() {
        return orderService.getOrders();
    }

    @DeleteMapping("/{orderId}")
    public Order cancelOrder(@PathVariable String orderId) {
        return orderService.cancelOrder(orderId);
    }

    @PutMapping("/{orderId}/fill")
    public Order fillOrder(@PathVariable String orderId) {
        return orderService.fillOrder(orderId);
    }

}
