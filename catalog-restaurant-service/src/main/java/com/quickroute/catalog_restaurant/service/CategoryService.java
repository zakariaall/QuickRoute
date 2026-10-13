package com.quickroute.catalog_restaurant.service;

import com.quickroute.catalog_restaurant.dto.CategoryResponse;
import com.quickroute.catalog_restaurant.dto.CreateCategoryRequest;

import java.util.List;
import java.util.UUID;

public interface CategoryService {

    CategoryResponse create(CreateCategoryRequest request);

    List<CategoryResponse> findByRestaurantId(UUID restaurantId);

    void delete(UUID id);
}
