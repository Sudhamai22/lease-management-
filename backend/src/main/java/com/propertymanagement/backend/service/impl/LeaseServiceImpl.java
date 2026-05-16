package com.propertymanagement.backend.service.impl;

import com.propertymanagement.backend.entity.LeaseAgreement;
import com.propertymanagement.backend.enums.LeaseStatus;
import com.propertymanagement.backend.exception.ResourceNotFoundException;
import com.propertymanagement.backend.repository.LeaseRepository;
import com.propertymanagement.backend.service.LeaseService;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class LeaseServiceImpl implements LeaseService {

    private final LeaseRepository leaseRepository;

    public LeaseServiceImpl(LeaseRepository leaseRepository) {
        this.leaseRepository = leaseRepository;
    }

    @Override
    public LeaseAgreement requestLease(LeaseAgreement lease) {
        lease.setLeaseStatus(LeaseStatus.REQUESTED);
        return saveLease(lease);
    }

    @Override
    public LeaseAgreement saveLease(LeaseAgreement lease) {
        if (lease.getCreatedAt() == null) {
            lease.setCreatedAt(LocalDateTime.now());
        }
        return leaseRepository.save(lease);
    }

    @Override
    public LeaseAgreement approveLease(Long id) {
        LeaseAgreement lease = getLeaseById(id);
        lease.setLeaseStatus(LeaseStatus.APPROVED);
        return leaseRepository.save(lease);
    }

    @Override
    public List<LeaseAgreement> getAllLeases() {
        return leaseRepository.findAll();
    }

    @Override
    public LeaseAgreement getLeaseById(Long id) {
        return leaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lease not found with id: " + id));
    }
}