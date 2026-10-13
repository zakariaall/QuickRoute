package com.quickroute.delivery_tracking.consumer;

import com.quickroute.order.dto.event.OrderCreatedEvent;
import com.quickroute.order.dto.event.DriverAssignedEvent;
import com.quickroute.delivery_tracking.service.TrackingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final TrackingService trackingService;

    @KafkaListener(topics = "orders-topic", groupId = "tracking-service-group")
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Kafka: Commande reçue dans Tracking Service avec ID: {}", event.getOrderId());
        if (event.getOrderId() != null) {
            trackingService.noteOrderAwaitingDriver(event.getOrderId().toString());
        }
    }

    @KafkaListener(topics = "delivery-assigned-topic", groupId = "tracking-service-group")
    public void handleDriverAssigned(DriverAssignedEvent event) {
        if (event.getOrderId() != null && event.getDriverId() != null) {
            trackingService.assignDriverToOrder(event.getOrderId().toString(), event.getDriverId());
        }
    }
}
