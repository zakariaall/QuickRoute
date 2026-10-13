package com.quickroute.catalog_restaurant.repository;

import com.quickroute.catalog_restaurant.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, UUID> {

    List<Restaurant> findByOwnerId(String ownerId);

    List<Restaurant> findByStatus(com.quickroute.catalog_restaurant.model.RestaurantStatus status);
}
