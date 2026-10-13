package com.quickroute.order.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItemResponse {
    private UUID id;
    private UUID productId;
    private String productName;
    private BigDecimal price;
    private Integer quantity;
}
