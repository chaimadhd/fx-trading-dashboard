package com.chaima.fxtrading.repository;

import com.chaima.fxtrading.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<OrderEntity, String> {
}
