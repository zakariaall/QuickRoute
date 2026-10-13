package com.quickroute.catalog_restaurant.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "restaurants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false, length = 500)
    private String address;

    private String phone;

    private String cuisine;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "owner_id", nullable = false)
    private String ownerId; // Keycloak User ID

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RestaurantStatus status = RestaurantStatus.CLOSED;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Category> categories = new ArrayList<>();
}
