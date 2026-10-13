package com.quickroute.order.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateOrderRequest {

    @NotNull(message = "L'ID du restaurant est obligatoire")
    private UUID restaurantId;

    @NotBlank(message = "L'adresse de livraison est obligatoire")
    private String deliveryAddress;

    @NotEmpty(message = "La commande doit contenir au moins un produit")
    private List<OrderItemRequest> items;
}
