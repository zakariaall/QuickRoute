package com.quickroute.catalog_restaurant.repository;

import com.quickroute.catalog_restaurant.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    List<Category> findByRestaurantId(UUID restaurantId);
}
