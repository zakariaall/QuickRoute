package com.quickroute.catalog_restaurant.controller;

import com.quickroute.catalog_restaurant.dto.CategoryResponse;
import com.quickroute.catalog_restaurant.dto.CreateCategoryRequest;
import com.quickroute.catalog_restaurant.service.CategoryService;
import com.quickroute.catalog_restaurant.model.Restaurant;
import com.quickroute.catalog_restaurant.repository.CategoryRepository;
import com.quickroute.catalog_restaurant.repository.RestaurantRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final CategoryRepository categoryRepository;
    private final RestaurantRepository restaurantRepository;

    @PostMapping
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CreateCategoryRequest request,
                                                    @AuthenticationPrincipal Jwt jwt) {
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new com.quickroute.catalog_restaurant.exception.RestaurantNotFoundException(request.getRestaurantId()));
        requireOwnerOrAdmin(restaurant, jwt);
        CategoryResponse response = categoryService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<CategoryResponse>> findByRestaurant(@PathVariable UUID restaurantId) {
        return ResponseEntity.ok(categoryService.findByRestaurantId(restaurantId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        var category = categoryRepository.findById(id)
                .orElseThrow(() -> new com.quickroute.catalog_restaurant.exception.CategoryNotFoundException(id));
        requireOwnerOrAdmin(category.getRestaurant(), jwt);
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private void requireOwnerOrAdmin(Restaurant restaurant, Jwt jwt) {
        if (!restaurant.getOwnerId().equals(jwt.getSubject()) && !isAdmin(jwt)) {
            throw new AccessDeniedException("Restaurant owner access required");
        }
    }

    private boolean isAdmin(Jwt jwt) {
        java.util.Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        Object rolesValue = realmAccess == null ? null : realmAccess.get("roles");
        return rolesValue instanceof java.util.List<?> roles && roles.contains("ADMIN");
    }
}
