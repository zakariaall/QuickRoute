package com.quickroute.delivery_tracking.service;

import com.quickroute.delivery_tracking.dto.LocationUpdateRequest;
import com.quickroute.delivery_tracking.model.DriverLocation;

import java.util.Optional;

public interface TrackingService {
    DriverLocation updateLocation(String driverId, LocationUpdateRequest request);
    Optional<DriverLocation> getDriverLocationByOrder(String orderId);
    void noteOrderAwaitingDriver(String orderId);
    void assignDriverToOrder(String orderId, String driverId);
}
