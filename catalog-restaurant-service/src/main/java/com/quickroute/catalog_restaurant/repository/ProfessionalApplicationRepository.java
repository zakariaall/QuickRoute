package com.quickroute.catalog_restaurant.repository;

import com.quickroute.catalog_restaurant.model.ProfessionalApplication;
import com.quickroute.catalog_restaurant.model.ProfessionalApplication.ApplicationStatus;
import com.quickroute.catalog_restaurant.model.ProfessionalApplication.ApplicationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProfessionalApplicationRepository extends JpaRepository<ProfessionalApplication, UUID> {
    List<ProfessionalApplication> findByApplicantIdOrderByCreatedAtDesc(String applicantId);
    boolean existsByApplicantIdAndApplicationTypeAndStatus(String applicantId, ApplicationType type, ApplicationStatus status);
}
