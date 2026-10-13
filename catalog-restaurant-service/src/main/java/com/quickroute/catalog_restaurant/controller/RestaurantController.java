package com.quickroute.catalog_restaurant.controller;

import com.quickroute.catalog_restaurant.dto.*;
import com.quickroute.catalog_restaurant.service.RestaurantService;
import com.quickroute.catalog_restaurant.repository.RestaurantRepository;
import com.quickroute.catalog_restaurant.repository.ProfessionalApplicationRepository;
import com.quickroute.catalog_restaurant.model.ProfessionalApplication.ApplicationStatus;
import com.quickroute.catalog_restaurant.model.ProfessionalApplication.ApplicationType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final RestaurantRepository restaurantRepository;
    private final ProfessionalApplicationRepository applications;

    @PostMapping
    public ResponseEntity<RestaurantResponse> create(@Valid @RequestBody CreateRestaurantRequest request, @AuthenticationPrincipal Jwt jwt) {
        if (!isAdmin(jwt) && !applications.existsByApplicantIdAndApplicationTypeAndStatus(
                jwt.getSubject(), ApplicationType.RESTAURANT, ApplicationStatus.APPROVED)) {
            throw new AccessDeniedException("An approved restaurant application is required");
        }
        RestaurantResponse response = restaurantService.create(request, jwt.getSubject());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<RestaurantResponse>> findAll() {
        return ResponseEntity.ok(restaurantService.findAll());
    }

    @GetMapping("/mine")
    public ResponseEntity<List<RestaurantResponse>> findMine(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(restaurantService.findByOwnerId(jwt.getSubject()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantDetailResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(restaurantService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRestaurantRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        requireOwnerOrAdmin(id, jwt);
        return ResponseEntity.ok(restaurantService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        requireOwnerOrAdmin(id, jwt);
        restaurantService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private void requireOwnerOrAdmin(UUID id, Jwt jwt) {
        var restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new com.quickroute.catalog_restaurant.exception.RestaurantNotFoundException(id));
        if (!restaurant.getOwnerId().equals(jwt.getSubject()) && !isAdmin(jwt)) {
            throw new AccessDeniedException("Only the restaurant owner can change this restaurant");
        }
    }

    private boolean isAdmin(Jwt jwt) {
        java.util.Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        Object rolesValue = realmAccess == null ? null : realmAccess.get("roles");
        return rolesValue instanceof java.util.List<?> roles && roles.contains("ADMIN");
    }
}
