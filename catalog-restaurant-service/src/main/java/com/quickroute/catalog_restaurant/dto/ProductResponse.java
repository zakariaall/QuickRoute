package com.quickroute.catalog_restaurant.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductResponse {

    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private boolean available;
    private String imageUrl;
}
