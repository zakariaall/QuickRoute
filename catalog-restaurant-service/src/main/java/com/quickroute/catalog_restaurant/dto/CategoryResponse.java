package com.quickroute.catalog_restaurant.dto;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoryResponse {

    private UUID id;
    private String name;
    private List<ProductResponse> products;
}
