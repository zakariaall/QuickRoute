package com.quickroute.catalog_restaurant.service.impl;

import com.quickroute.catalog_restaurant.dto.*;
import com.quickroute.catalog_restaurant.exception.RestaurantNotFoundException;
import com.quickroute.catalog_restaurant.model.Restaurant;
import com.quickroute.catalog_restaurant.repository.RestaurantRepository;
import com.quickroute.catalog_restaurant.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RestaurantServiceImpl implements RestaurantService {

    private final RestaurantRepository restaurantRepository;

    @Override
    public RestaurantResponse create(CreateRestaurantRequest request, String ownerId) {
        Restaurant restaurant = Restaurant.builder()
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .phone(request.getPhone())
                .ownerId(ownerId)
                .build();

        Restaurant saved = restaurantRepository.save(restaurant);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RestaurantResponse> findAll() {
        return restaurantRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RestaurantResponse> findByOwnerId(String ownerId) {
        return restaurantRepository.findByOwnerId(ownerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RestaurantDetailResponse findById(UUID id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RestaurantNotFoundException(id));

        return RestaurantDetailResponse.builder()
                .id(restaurant.getId())
                .name(restaurant.getName())
                .description(restaurant.getDescription())
                .address(restaurant.getAddress())
                .phone(restaurant.getPhone())
                .status(restaurant.getStatus())
                .cuisine(restaurant.getCuisine())
                .imageUrl(restaurant.getImageUrl())
                .categories(
                        restaurant.getCategories().stream()
                                .map(cat -> CategoryResponse.builder()
                                        .id(cat.getId())
                                        .name(cat.getName())
                                        .products(
                                                cat.getProducts().stream()
                                                        .map(prod -> ProductResponse.builder()
                                                                .id(prod.getId())
                                                                .name(prod.getName())
                                                                .description(prod.getDescription())
                                                                .price(prod.getPrice())
                                                                .available(prod.isAvailable())
                                                                .imageUrl(prod.getImageUrl())
                                                                .build())
                                                        .collect(Collectors.toList()))
                                        .build())
                                .collect(Collectors.toList()))
                .build();
    }

    @Override
    public RestaurantResponse update(UUID id, UpdateRestaurantRequest request) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RestaurantNotFoundException(id));

        if (request.getName() != null) restaurant.setName(request.getName());
        if (request.getDescription() != null) restaurant.setDescription(request.getDescription());
        if (request.getAddress() != null) restaurant.setAddress(request.getAddress());
        if (request.getPhone() != null) restaurant.setPhone(request.getPhone());
        if (request.getStatus() != null) restaurant.setStatus(request.getStatus());

        Restaurant updated = restaurantRepository.save(restaurant);
        return toResponse(updated);
    }

    @Override
    public void delete(UUID id) {
        if (!restaurantRepository.existsById(id)) {
            throw new RestaurantNotFoundException(id);
        }
        restaurantRepository.deleteById(id);
    }

    private RestaurantResponse toResponse(Restaurant restaurant) {
        return RestaurantResponse.builder()
                .id(restaurant.getId())
                .name(restaurant.getName())
                .description(restaurant.getDescription())
                .address(restaurant.getAddress())
                .phone(restaurant.getPhone())
                .status(restaurant.getStatus())
                .cuisine(restaurant.getCuisine())
                .imageUrl(restaurant.getImageUrl())
                .build();
    }
}
