package com.quickroute.catalog_restaurant.service;

import com.quickroute.catalog_restaurant.dto.*;

import java.util.List;
import java.util.UUID;

public interface ProductService {

    ProductResponse create(CreateProductRequest request);

    List<ProductResponse> findByRestaurantId(UUID restaurantId);

    ProductResponse findById(UUID id);

    ProductResponse update(UUID id, UpdateProductRequest request);

    void delete(UUID id);
}
