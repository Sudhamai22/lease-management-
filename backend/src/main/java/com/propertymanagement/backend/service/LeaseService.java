package com.propertymanagement.backend.service;

import java.util.List;

import com.propertymanagement.backend.entity.LeaseAgreement;

public interface LeaseService {

    LeaseAgreement requestLease(LeaseAgreement lease);

    LeaseAgreement saveLease(LeaseAgreement lease);

    LeaseAgreement approveLease(Long id, Long approvedById, java.time.LocalDate leaseStart, java.time.LocalDate leaseEnd);

    List<LeaseAgreement> getAllLeases();

    LeaseAgreement getLeaseById(Long id);
    java.util.List<LeaseAgreement> fixMissingApprovedLeases();

}