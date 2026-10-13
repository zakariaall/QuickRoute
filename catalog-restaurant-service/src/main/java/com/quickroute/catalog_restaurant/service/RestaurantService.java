package com.quickroute.catalog_restaurant.service;

import com.quickroute.catalog_restaurant.dto.*;

import java.util.List;
import java.util.UUID;

public interface RestaurantService {

    RestaurantResponse create(CreateRestaurantRequest request, String ownerId);

    List<RestaurantResponse> findAll();

    List<RestaurantResponse> findByOwnerId(String ownerId);

    RestaurantDetailResponse findById(UUID id);

    RestaurantResponse update(UUID id, UpdateRestaurantRequest request);

    void delete(UUID id);
}
