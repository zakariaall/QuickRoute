package com.quickroute.catalog_restaurant.controller;

import com.quickroute.catalog_restaurant.dto.*;
import com.quickroute.catalog_restaurant.service.ProductService;
import com.quickroute.catalog_restaurant.model.Restaurant;
import com.quickroute.catalog_restaurant.repository.CategoryRepository;
import com.quickroute.catalog_restaurant.repository.ProductRepository;
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
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest request,
                                                   @AuthenticationPrincipal Jwt jwt) {
        var category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new com.quickroute.catalog_restaurant.exception.CategoryNotFoundException(request.getCategoryId()));
        requireOwnerOrAdmin(category.getRestaurant(), jwt);
        ProductResponse response = productService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<ProductResponse>> findByRestaurant(@PathVariable UUID restaurantId) {
        return ResponseEntity.ok(productService.findByRestaurantId(restaurantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        var product = productRepository.findById(id)
                .orElseThrow(() -> new com.quickroute.catalog_restaurant.exception.ProductNotFoundException(id));
        requireOwnerOrAdmin(product.getCategory().getRestaurant(), jwt);
        return ResponseEntity.ok(productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        var product = productRepository.findById(id)
                .orElseThrow(() -> new com.quickroute.catalog_restaurant.exception.ProductNotFoundException(id));
        requireOwnerOrAdmin(product.getCategory().getRestaurant(), jwt);
        productService.delete(id);
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
