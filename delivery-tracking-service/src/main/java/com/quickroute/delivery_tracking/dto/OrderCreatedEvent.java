package com.quickroute.delivery_tracking.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderCreatedEvent {
    private UUID orderId;
    private String customerId;
    private UUID restaurantId;
    private BigDecimal totalAmount;
    private String deliveryAddress;
    private LocalDateTime timestamp;
}
