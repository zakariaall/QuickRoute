package com.quickroute.catalog_restaurant.repository;

import com.quickroute.catalog_restaurant.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    List<Product> findByCategoryId(UUID categoryId);

    List<Product> findByCategoryRestaurantId(UUID restaurantId);

    List<Product> findByAvailableTrue();
}
