package com.quickroute.catalog_restaurant.dto;

import com.quickroute.catalog_restaurant.model.ProfessionalApplication.ApplicationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateProfessionalApplicationRequest(
        @NotNull ApplicationType applicationType,
        @NotBlank @Size(max = 180) String name,
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(max = 30) String phone,
        @Size(max = 500) String address,
        @Size(max = 3000) String details) { }
