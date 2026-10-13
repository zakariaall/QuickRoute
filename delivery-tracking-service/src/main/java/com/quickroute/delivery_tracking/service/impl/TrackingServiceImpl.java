package com.quickroute.delivery_tracking.service.impl;

import com.quickroute.delivery_tracking.dto.LocationUpdateRequest;
import com.quickroute.delivery_tracking.model.DriverLocation;
import com.quickroute.delivery_tracking.repository.DriverLocationRepository;
import com.quickroute.delivery_tracking.service.TrackingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrackingServiceImpl implements TrackingService {

    private final DriverLocationRepository driverLocationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public DriverLocation updateLocation(String driverId, LocationUpdateRequest request) {
        if (request.getOrderId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'identifiant de livraison est obligatoire");
        }
        DriverLocation location = driverLocationRepository.findByDriverIdAndCurrentOrderId(driverId, request.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Aucune livraison active n'est assignée à ce livreur"));

        if (location.getCurrentOrderId() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Aucune livraison active n'est assignée à ce livreur");
        }
        location.setLocation(new GeoJsonPoint(request.getLongitude(), request.getLatitude()));
        location.setUpdatedAt(LocalDateTime.now());
        DriverLocation saved = driverLocationRepository.save(location);

        // Diffuser les coordonnées GPS en direct via WebSockets aux abonnés de la commande
        if (saved.getCurrentOrderId() != null) {
            String destination = "/topic/orders/" + saved.getCurrentOrderId() + "/tracking";
            messagingTemplate.convertAndSend(destination, request);
            log.info("Position diffusée via WebSocket vers {} : lat={}, lng={}",
                    destination, request.getLatitude(), request.getLongitude());
        }

        return saved;
    }

    @Override
    public Optional<DriverLocation> getDriverLocationByOrder(String orderId) {
        return driverLocationRepository.findByCurrentOrderId(orderId);
    }

    @Override
    public void noteOrderAwaitingDriver(String orderId) {
        log.info("Commande {} reçue; en attente d'une attribution réelle de livreur", orderId);
    }

    @Override
    public void assignDriverToOrder(String orderId, String driverId) {
        DriverLocation assignment = driverLocationRepository.findByDriverIdAndCurrentOrderId(driverId, orderId)
                .orElseGet(() -> DriverLocation.builder().driverId(driverId).currentOrderId(orderId).build());
        assignment.setAvailable(false);
        assignment.setUpdatedAt(LocalDateTime.now());
        driverLocationRepository.save(assignment);
        log.info("Commande {} attribuée au livreur {} pour le suivi GPS", orderId, driverId);
    }
}
