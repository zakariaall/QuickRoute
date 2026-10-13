package com.quickroute.delivery_tracking.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "driver_locations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DriverLocation {

    @Id
    private String id;

    private String driverId;

    private String currentOrderId;

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location;

    private boolean available;

    private LocalDateTime updatedAt;
}
