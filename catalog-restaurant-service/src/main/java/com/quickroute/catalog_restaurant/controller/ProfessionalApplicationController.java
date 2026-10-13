package com.quickroute.catalog_restaurant.controller;

import com.quickroute.catalog_restaurant.dto.CreateProfessionalApplicationRequest;
import com.quickroute.catalog_restaurant.model.ProfessionalApplication;
import com.quickroute.catalog_restaurant.model.ProfessionalApplication.ApplicationStatus;
import com.quickroute.catalog_restaurant.model.ProfessionalApplication.ApplicationType;
import com.quickroute.catalog_restaurant.repository.ProfessionalApplicationRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ProfessionalApplicationController {
    private final ProfessionalApplicationRepository applications;

    @PostMapping
    public ResponseEntity<ProfessionalApplication> submit(
            @Valid @RequestBody CreateProfessionalApplicationRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String applicantId = jwt.getSubject();
        if (applications.existsByApplicantIdAndApplicationTypeAndStatus(applicantId, request.applicationType(), ApplicationStatus.PENDING)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        var application = ProfessionalApplication.builder()
                .applicantId(applicantId)
                .applicationType(request.applicationType())
                .name(request.name().trim())
                .email(request.email().trim().toLowerCase())
                .phone(request.phone().trim())
                .address(blankToNull(request.address()))
                .details(blankToNull(request.details()))
                .status(ApplicationStatus.PENDING)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(applications.save(application));
    }

    @GetMapping("/mine")
    public List<ProfessionalApplication> mine(@AuthenticationPrincipal Jwt jwt) {
        return applications.findByApplicantIdOrderByCreatedAtDesc(jwt.getSubject());
    }

    @GetMapping
    public List<ProfessionalApplication> all(@AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        return applications.findAll();
    }

    @PatchMapping("/{id}/status")
    public ProfessionalApplication review(@PathVariable UUID id, @RequestBody ReviewRequest request,
                                          @AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        ProfessionalApplication application = applications.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(HttpStatus.NOT_FOUND));
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.CONFLICT, "Application already reviewed");
        }
        application.setStatus(request.status());
        application.setReviewedAt(LocalDateTime.now());
        application.setReviewedBy(jwt.getSubject());
        return applications.save(application);
    }

    private void requireAdmin(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        Object rolesValue = realmAccess == null ? null : realmAccess.get("roles");
        if (!(rolesValue instanceof List<?> roles) || !roles.contains("ADMIN")) {
            throw new AccessDeniedException("Administrator role required");
        }
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public record ReviewRequest(ApplicationStatus status) {
        public ReviewRequest {
            if (status == null || status == ApplicationStatus.PENDING) {
                throw new IllegalArgumentException("Review status must be APPROVED or REJECTED");
            }
        }
    }
}
