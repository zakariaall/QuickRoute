package com.quickroute.order.controller;

import com.quickroute.order.dto.request.CreateOrderRequest;
import com.quickroute.order.dto.response.OrderResponse;
import com.quickroute.order.model.OrderStatus;
import com.quickroute.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final JdbcTemplate jdbcTemplate;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request,
                                                       @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request, jwt.getSubject()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        OrderResponse order = orderService.getOrderById(id);
        if (!jwt.getSubject().equals(order.getCustomerId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByCustomer(@PathVariable String customerId,
                                                                    @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(jwt.getSubject()));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByRestaurant(@PathVariable UUID restaurantId,
                                                                      @AuthenticationPrincipal Jwt jwt) {
        requireRestaurantOwnerOrAdmin(restaurantId, jwt);
        return ResponseEntity.ok(orderService.getOrdersByRestaurant(restaurantId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable UUID id,
                                                            @RequestParam OrderStatus status,
                                                            @AuthenticationPrincipal Jwt jwt) {
        OrderResponse order = orderService.getOrderById(id);
        requireRestaurantOwnerOrAdmin(order.getRestaurantId(), jwt);
        if (!isAdmin(jwt) && status != OrderStatus.PREPARING
                && status != OrderStatus.READY_FOR_PICKUP && status != OrderStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This status can only be set by delivery operations");
        }
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @GetMapping("/deliveries/available")
    public ResponseEntity<List<OrderResponse>> getAvailableDeliveries(@AuthenticationPrincipal Jwt jwt) {
        requireApprovedDriver(jwt);
        return ResponseEntity.ok(orderService.getAvailableDeliveries());
    }

    @GetMapping("/deliveries/mine")
    public ResponseEntity<List<OrderResponse>> getMyDeliveries(@AuthenticationPrincipal Jwt jwt) {
        requireApprovedDriver(jwt);
        return ResponseEntity.ok(orderService.getMyDeliveries(jwt.getSubject()));
    }

    @PostMapping("/deliveries/{id}/accept")
    public ResponseEntity<OrderResponse> acceptDelivery(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        requireApprovedDriver(jwt);
        return ResponseEntity.ok(orderService.acceptDelivery(id, jwt.getSubject()));
    }

    @PostMapping("/deliveries/{id}/complete")
    public ResponseEntity<OrderResponse> completeDelivery(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        requireApprovedDriver(jwt);
        return ResponseEntity.ok(orderService.completeDelivery(id, jwt.getSubject()));
    }

    private void requireRestaurantOwnerOrAdmin(UUID restaurantId, Jwt jwt) {
        if (isAdmin(jwt)) return;
        try {
            String ownerId = jdbcTemplate.queryForObject(
                    "SELECT owner_id FROM restaurants WHERE id = ?", String.class, restaurantId);
            if (jwt.getSubject().equals(ownerId)) return;
        } catch (org.springframework.dao.EmptyResultDataAccessException ignored) {
            // A missing restaurant is not a valid authorization target.
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Restaurant owner access required");
    }

    private boolean isAdmin(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        Object rolesValue = realmAccess == null ? null : realmAccess.get("roles");
        return rolesValue instanceof List<?> roles && roles.contains("ADMIN");
    }

    private void requireApprovedDriver(Jwt jwt) {
        if (isAdmin(jwt)) return;
        Boolean approved = jdbcTemplate.queryForObject("""
                SELECT EXISTS (SELECT 1 FROM professional_applications
                    WHERE applicant_id = ? AND application_type = 'DRIVER' AND status = 'APPROVED')
                """, Boolean.class, jwt.getSubject());
        if (!Boolean.TRUE.equals(approved)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Une demande livreur approuvée est nécessaire");
        }
    }
}
