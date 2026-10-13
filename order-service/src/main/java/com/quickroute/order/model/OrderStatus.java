package com.quickroute.order.model;

public enum OrderStatus {
    CREATED,
    PENDING_PAYMENT,
    PAID,
    PREPARING,
    READY_FOR_PICKUP,
    IN_DELIVERY,
    DELIVERED,
    CANCELLED
}
