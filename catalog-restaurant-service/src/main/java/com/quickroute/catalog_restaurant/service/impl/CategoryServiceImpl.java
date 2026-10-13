package com.quickroute.catalog_restaurant.service.impl;

import com.quickroute.catalog_restaurant.dto.CategoryResponse;
import com.quickroute.catalog_restaurant.dto.CreateCategoryRequest;
import com.quickroute.catalog_restaurant.dto.ProductResponse;
import com.quickroute.catalog_restaurant.exception.CategoryNotFoundException;
import com.quickroute.catalog_restaurant.exception.RestaurantNotFoundException;
import com.quickroute.catalog_restaurant.model.Category;
import com.quickroute.catalog_restaurant.model.Restaurant;
import com.quickroute.catalog_restaurant.repository.CategoryRepository;
import com.quickroute.catalog_restaurant.repository.RestaurantRepository;
import com.quickroute.catalog_restaurant.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final RestaurantRepository restaurantRepository;

    @Override
    public CategoryResponse create(CreateCategoryRequest request) {
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new RestaurantNotFoundException(request.getRestaurantId()));

        Category category = Category.builder()
                .name(request.getName())
                .restaurant(restaurant)
                .build();

        Category saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> findByRestaurantId(UUID restaurantId) {
        return categoryRepository.findByRestaurantId(restaurantId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(UUID id) {
        if (!categoryRepository.existsById(id)) {
            throw new CategoryNotFoundException(id);
        }
        categoryRepository.deleteById(id);
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .products(
                        category.getProducts().stream()
                                .map(p -> ProductResponse.builder()
                                        .id(p.getId())
                                        .name(p.getName())
                                        .description(p.getDescription())
                                        .price(p.getPrice())
                                        .available(p.isAvailable())
                                        .imageUrl(p.getImageUrl())
                                        .build())
                                .collect(Collectors.toList()))
                .build();
    }
}
