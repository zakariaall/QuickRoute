package com.quickroute.catalog_restaurant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateProductRequest {

    @NotBlank(message = "Le nom du produit est obligatoire")
    private String name;

    private String description;

    @NotNull(message = "Le prix est obligatoire")
    @Positive(message = "Le prix doit être positif")
    private BigDecimal price;

    private String imageUrl;

    @NotNull(message = "L'ID de la catégorie est obligatoire")
    private UUID categoryId;
}
