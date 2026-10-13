package com.quickroute.catalog_restaurant.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateRestaurantRequest {

    @NotBlank(message = "Le nom du restaurant est obligatoire")
    private String name;

    private String description;

    @NotBlank(message = "L'adresse est obligatoire")
    private String address;

    private String phone;
}
