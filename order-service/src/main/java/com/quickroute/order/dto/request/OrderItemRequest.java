package com.quickroute.order.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItemRequest {

    @NotNull(message = "L'ID du produit est obligatoire")
    private UUID productId;

    private String productName;

    private BigDecimal price;

    @NotNull(message = "La quantité est obligatoire")
    @Min(value = 1, message = "La quantité minimale est de 1")
    private Integer quantity;
}
