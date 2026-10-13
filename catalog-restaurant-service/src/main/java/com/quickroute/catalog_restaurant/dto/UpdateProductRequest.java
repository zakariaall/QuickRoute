package com.quickroute.catalog_restaurant.dto;

import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateProductRequest {

    private String name;
    private String description;

    @Positive(message = "Le prix doit être positif")
    private BigDecimal price;
    private Boolean available;
    private String imageUrl;
}
