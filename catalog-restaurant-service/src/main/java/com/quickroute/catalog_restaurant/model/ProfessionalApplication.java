package com.quickroute.catalog_restaurant.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "professional_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfessionalApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "applicant_id", nullable = false)
    private String applicantId;

    @Enumerated(EnumType.STRING)
    @Column(name = "application_type", nullable = false, length = 20)
    private ApplicationType applicationType;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(length = 500)
    private String address;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public enum ApplicationType { RESTAURANT, DRIVER }
    public enum ApplicationStatus { PENDING, APPROVED, REJECTED }
}
