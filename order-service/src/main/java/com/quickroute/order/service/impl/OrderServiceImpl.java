package com.quickroute.order.service.impl;

import com.quickroute.order.dto.event.OrderCreatedEvent;
import com.quickroute.order.dto.event.DriverAssignedEvent;
import com.quickroute.order.dto.request.CreateOrderRequest;
import com.quickroute.order.dto.response.OrderItemResponse;
import com.quickroute.order.dto.response.OrderResponse;
import com.quickroute.order.model.Order;
import com.quickroute.order.model.OrderItem;
import com.quickroute.order.model.OrderStatus;
import com.quickroute.order.repository.OrderRepository;
import com.quickroute.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final JdbcTemplate jdbcTemplate;

    private static final String ORDERS_TOPIC = "orders-topic";
    private static final String DELIVERY_ASSIGNED_TOPIC = "delivery-assigned-topic";

    @Override
    public OrderResponse createOrder(CreateOrderRequest request, String customerId) {
        Order order = Order.builder()
                .customerId(customerId)
                .restaurantId(request.getRestaurantId())
                .deliveryAddress(request.getDeliveryAddress())
                .status(OrderStatus.CREATED)
                .totalAmount(BigDecimal.ZERO)
                .build();

        List<OrderItem> orderItems = request.getItems().stream()
                .map(itemReq -> {
                    CatalogProduct product = findOrderableProduct(itemReq.getProductId(), request.getRestaurantId());
                    return OrderItem.builder()
                            .productId(itemReq.getProductId())
                            .productName(product.name())
                            .price(product.price())
                            .quantity(itemReq.getQuantity())
                            .order(order)
                            .build();
                })
                .collect(Collectors.toList());

        BigDecimal totalAmount = orderItems.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalAmount(totalAmount);

        order.setItems(orderItems);
        Order savedOrder = orderRepository.save(order);

        // Publier l'événement sur Kafka
        OrderCreatedEvent event = OrderCreatedEvent.builder()
                .orderId(savedOrder.getId())
                .customerId(savedOrder.getCustomerId())
                .restaurantId(savedOrder.getRestaurantId())
                .totalAmount(savedOrder.getTotalAmount())
                .deliveryAddress(savedOrder.getDeliveryAddress())
                .timestamp(LocalDateTime.now())
                .build();

        kafkaTemplate.send(ORDERS_TOPIC, savedOrder.getId().toString(), event);
        log.info("Événement OrderCreatedEvent envoyé sur Kafka pour la commande : {}", savedOrder.getId());

        return toResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée avec l'ID : " + id));
        return toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByCustomer(String customerId) {
        return orderRepository.findByCustomerId(customerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByRestaurant(UUID restaurantId) {
        return orderRepository.findByRestaurantId(restaurantId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAvailableDeliveries() {
        return orderRepository.findByStatusAndDriverIdIsNullOrderByCreatedAtAsc(OrderStatus.READY_FOR_PICKUP)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyDeliveries(String driverId) {
        return orderRepository.findByDriverIdAndStatusOrderByCreatedAtDesc(driverId, OrderStatus.IN_DELIVERY)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public OrderResponse acceptDelivery(UUID id, String driverId) {
        Order order = orderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Commande introuvable"));
        if (order.getStatus() != OrderStatus.READY_FOR_PICKUP || order.getDriverId() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette livraison n'est plus disponible");
        }
        order.setDriverId(driverId);
        order.setStatus(OrderStatus.IN_DELIVERY);
        Order assigned = orderRepository.save(order);
        kafkaTemplate.send(DELIVERY_ASSIGNED_TOPIC, assigned.getId().toString(), DriverAssignedEvent.builder()
                .orderId(assigned.getId()).driverId(driverId).timestamp(LocalDateTime.now()).build());
        return toResponse(assigned);
    }

    @Override
    public OrderResponse completeDelivery(UUID id, String driverId) {
        Order order = orderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Commande introuvable"));
        if (!driverId.equals(order.getDriverId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cette livraison n'est pas attribuée à ce livreur");
        }
        if (order.getStatus() != OrderStatus.IN_DELIVERY) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette commande n'est pas en cours de livraison");
        }
        order.setStatus(OrderStatus.DELIVERED);
        return toResponse(orderRepository.save(order));
    }

    @Override
    public OrderResponse updateOrderStatus(UUID id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée avec l'ID : " + id));
        if (!isValidTransition(order.getStatus(), status)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Impossible de passer la commande de " + order.getStatus() + " à " + status);
        }
        order.setStatus(status);
        return toResponse(orderRepository.save(order));
    }

    private CatalogProduct findOrderableProduct(UUID productId, UUID restaurantId) {
        try {
            return jdbcTemplate.queryForObject("""
                    SELECT p.name, p.price, p.available
                    FROM products p
                    JOIN categories c ON c.id = p.category_id
                    WHERE p.id = ? AND c.restaurant_id = ?
                    """, (rs, rowNum) -> new CatalogProduct(
                    rs.getString("name"), rs.getBigDecimal("price"), rs.getBoolean("available")), productId, restaurantId);
        } catch (org.springframework.dao.EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Un article n'appartient pas à ce restaurant ou n'existe plus");
        }
    }

    private boolean isValidTransition(OrderStatus current, OrderStatus next) {
        if (current == next) return true;
        return switch (current) {
            case CREATED, PENDING_PAYMENT -> next == OrderStatus.PREPARING || next == OrderStatus.CANCELLED;
            case PAID -> next == OrderStatus.PREPARING || next == OrderStatus.CANCELLED;
            case PREPARING -> next == OrderStatus.READY_FOR_PICKUP || next == OrderStatus.CANCELLED;
            case READY_FOR_PICKUP -> next == OrderStatus.IN_DELIVERY;
            case IN_DELIVERY -> next == OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
    }

    private record CatalogProduct(String name, BigDecimal price, boolean available) {
        private CatalogProduct {
            if (!available) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Un article de la commande n'est plus disponible");
            }
        }
    }

    private OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .restaurantId(order.getRestaurantId())
                .driverId(order.getDriverId())
                .deliveryAddress(order.getDeliveryAddress())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .items(order.getItems().stream()
                        .map(i -> OrderItemResponse.builder()
                                .id(i.getId())
                                .productId(i.getProductId())
                                .productName(i.getProductName())
                                .price(i.getPrice())
                                .quantity(i.getQuantity())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
