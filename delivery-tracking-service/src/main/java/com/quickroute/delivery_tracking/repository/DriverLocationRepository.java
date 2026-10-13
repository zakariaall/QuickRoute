package com.quickroute.delivery_tracking.repository;

import com.quickroute.delivery_tracking.model.DriverLocation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DriverLocationRepository extends MongoRepository<DriverLocation, String> {
    Optional<DriverLocation> findByDriverId(String driverId);
    Optional<DriverLocation> findByDriverIdAndCurrentOrderId(String driverId, String currentOrderId);
    Optional<DriverLocation> findByCurrentOrderId(String currentOrderId);
}
