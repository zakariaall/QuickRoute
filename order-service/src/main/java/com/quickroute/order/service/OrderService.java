package com.quickroute.order.service;

import com.quickroute.order.dto.request.CreateOrderRequest;
import com.quickroute.order.dto.response.OrderResponse;
import com.quickroute.order.model.OrderStatus;

import java.util.List;
import java.util.UUID;

public interface OrderService {
    OrderResponse createOrder(CreateOrderRequest request, String customerId);
    OrderResponse getOrderById(UUID id);
    List<OrderResponse> getOrdersByCustomer(String customerId);
    List<OrderResponse> getOrdersByRestaurant(UUID restaurantId);
    List<OrderResponse> getAvailableDeliveries();
    List<OrderResponse> getMyDeliveries(String driverId);
    OrderResponse acceptDelivery(UUID id, String driverId);
    OrderResponse completeDelivery(UUID id, String driverId);
    OrderResponse updateOrderStatus(UUID id, OrderStatus status);
}
