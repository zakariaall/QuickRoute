package com.quickroute.delivery_tracking.controller;

import com.quickroute.delivery_tracking.dto.LocationUpdateRequest;
import com.quickroute.delivery_tracking.model.DriverLocation;
import com.quickroute.delivery_tracking.service.TrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final TrackingService trackingService;
    private final JdbcTemplate jdbcTemplate;

    @PostMapping("/drivers/{driverId}/location")
    public ResponseEntity<DriverLocation> updateLocation(
            @PathVariable String driverId,
            @Valid @RequestBody LocationUpdateRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        if (!jwt.getSubject().equals(driverId) && !isAdmin(jwt)) {
            throw new AccessDeniedException("A driver can only update their own location");
        }
        return ResponseEntity.ok(trackingService.updateLocation(driverId, request));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<DriverLocation> getDriverLocationByOrder(@PathVariable String orderId,
                                                                     @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) throw new AccessDeniedException("Authentication required");
        if (!isAdmin(jwt) && !canViewOrder(orderId, jwt.getSubject())) {
            throw new AccessDeniedException("Order tracking is available only to its participants");
        }
        return trackingService.getDriverLocationByOrder(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private boolean isAdmin(Jwt jwt) { return hasRole(jwt, "ADMIN"); }

    private boolean canViewOrder(String orderId, String subject) {
        Boolean allowed = jdbcTemplate.queryForObject("""
                SELECT EXISTS (
                    SELECT 1 FROM orders o
                    LEFT JOIN restaurants r ON r.id = o.restaurant_id
                    WHERE CAST(o.id AS VARCHAR) = ?
                      AND (o.customer_id = ? OR o.driver_id = ? OR r.owner_id = ?)
                )
                """, Boolean.class, orderId, subject, subject, subject);
        return Boolean.TRUE.equals(allowed);
    }

    private boolean hasRole(Jwt jwt, String role) {
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        Object rolesValue = realmAccess == null ? null : realmAccess.get("roles");
        return rolesValue instanceof List<?> roles && roles.contains(role);
    }
}
