package com.chaima.fxtrading;

import com.chaima.fxtrading.entity.OrderEntity;
import com.chaima.fxtrading.model.OrderSide;
import com.chaima.fxtrading.model.OrderStatus;
import com.chaima.fxtrading.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrderRepository orderRepository;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
    }

    @Test
    void shouldCreateOrder() throws Exception {
        String request = """
                {
                    "symbol": "EUR/USD",
                    "side": "BUY",
                    "quantity": 100
                }
                """;

        mockMvc.perform(
                        post("/api/orders")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(request)
                )
                .andExpect(status().isOk())
                .andExpect(result ->
                        assertThat(result.getResponse().getContentAsString())
                                .contains("\"symbol\":\"EUR/USD\"")
                                .contains("\"side\":\"BUY\"")
                                .contains("\"status\":\"NEW\"")
                );
    }

    @Test
    void shouldRejectInvalidQuantity() throws Exception {
        String request = """
                {
                    "symbol": "EUR/USD",
                    "side": "BUY",
                    "quantity": 0
                }
                """;

        mockMvc.perform(
                        post("/api/orders")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(request)
                )
                .andExpect(status().isBadRequest())
                .andExpect(result ->
                        assertThat(result.getResponse().getContentAsString())
                                .contains("Validation failed")
                );
    }

    @Test
    void shouldFillOrder() throws Exception {
        OrderEntity order = orderRepository.save(
                new OrderEntity(
                        "EUR/USD",
                        OrderSide.BUY,
                        new BigDecimal("100"),
                        new BigDecimal("1.1727"),
                        OrderStatus.NEW
                )
        );

        mockMvc.perform(
                        put("/api/orders/" + order.getId() + "/fill")
                )
                .andExpect(status().isOk())
                .andExpect(result ->
                        assertThat(result.getResponse().getContentAsString())
                                .contains("\"status\":\"FILLED\"")
                );
    }

    @Test
    void shouldCancelOrder() throws Exception {
        OrderEntity order = orderRepository.save(
                new OrderEntity(
                        "EUR/USD",
                        OrderSide.BUY,
                        new BigDecimal("100"),
                        new BigDecimal("1.1727"),
                        OrderStatus.NEW
                )
        );

        mockMvc.perform(
                        delete("/api/orders/" + order.getId())
                )
                .andExpect(status().isOk())
                .andExpect(result ->
                        assertThat(result.getResponse().getContentAsString())
                                .contains("\"status\":\"CANCELLED\"")
                );
    }
}