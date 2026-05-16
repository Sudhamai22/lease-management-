package com.propertymanagement.backend.service;

import com.propertymanagement.backend.entity.LeaseAgreement;

import java.util.List;

public interface LeaseService {

    LeaseAgreement requestLease(LeaseAgreement lease);

    LeaseAgreement saveLease(LeaseAgreement lease);

    LeaseAgreement approveLease(Long id);

    List<LeaseAgreement> getAllLeases();

    LeaseAgreement getLeaseById(Long id);

}