package com.quickroute.catalog_restaurant.dto;

import com.quickroute.catalog_restaurant.model.RestaurantStatus;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RestaurantDetailResponse {

    private UUID id;
    private String name;
    private String description;
    private String address;
    private String phone;
    private String cuisine;
    private String imageUrl;
    private RestaurantStatus status;
    private List<CategoryResponse> categories;
}
