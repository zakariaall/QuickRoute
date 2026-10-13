package com.quickroute.catalog_restaurant.service.impl;

import com.quickroute.catalog_restaurant.dto.*;
import com.quickroute.catalog_restaurant.exception.CategoryNotFoundException;
import com.quickroute.catalog_restaurant.exception.ProductNotFoundException;
import com.quickroute.catalog_restaurant.model.Category;
import com.quickroute.catalog_restaurant.model.Product;
import com.quickroute.catalog_restaurant.repository.CategoryRepository;
import com.quickroute.catalog_restaurant.repository.ProductRepository;
import com.quickroute.catalog_restaurant.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public ProductResponse create(CreateProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new CategoryNotFoundException(request.getCategoryId()));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .category(category)
                .build();

        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> findByRestaurantId(UUID restaurantId) {
        return productRepository.findByCategoryRestaurantId(restaurantId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse findById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        return toResponse(product);
    }

    @Override
    public ProductResponse update(UUID id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getAvailable() != null) product.setAvailable(request.getAvailable());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());

        Product updated = productRepository.save(product);
        return toResponse(updated);
    }

    @Override
    public void delete(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException(id);
        }
        productRepository.deleteById(id);
    }

    private ProductResponse toResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .available(product.isAvailable())
                .imageUrl(product.getImageUrl())
                .build();
    }
}
