package com.quickroute.catalog_restaurant.dto;

import com.quickroute.catalog_restaurant.model.RestaurantStatus;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateRestaurantRequest {

    private String name;
    private String description;
    private String address;
    private String phone;
    private RestaurantStatus status;
}
