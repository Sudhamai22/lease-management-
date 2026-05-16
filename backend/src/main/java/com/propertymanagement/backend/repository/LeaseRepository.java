package com.propertymanagement.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.propertymanagement.backend.entity.LeaseAgreement;
import com.propertymanagement.backend.enums.LeaseStatus;

public interface LeaseRepository
        extends JpaRepository<LeaseAgreement, Long> {
    
    List<LeaseAgreement> findByTenant_Id(Long tenantId);
    
    Optional<LeaseAgreement> findByTenant_IdAndProperty_IdAndLeaseStatus(Long tenantId, Long propertyId, LeaseStatus status);
    
    List<LeaseAgreement> findByTenant_IdAndLeaseStatusIn(Long tenantId, List<LeaseStatus> statuses);

}