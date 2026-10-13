package com.quickroute.catalog_restaurant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateCategoryRequest {

    @NotBlank(message = "Le nom de la catégorie est obligatoire")
    private String name;

    @NotNull(message = "L'ID du restaurant est obligatoire")
    private UUID restaurantId;
}
