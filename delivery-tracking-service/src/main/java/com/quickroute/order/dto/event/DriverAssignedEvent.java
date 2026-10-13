package com.quickroute.order.dto.event;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DriverAssignedEvent {
    private UUID orderId;
    private String driverId;
    private LocalDateTime timestamp;
}
