package com.quickroute.order.dto.response;

import com.quickroute.order.model.OrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderResponse {
    private UUID id;
    private String customerId;
    private UUID restaurantId;
    private String driverId;
    private String deliveryAddress;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
}
