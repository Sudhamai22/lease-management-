package com.propertymanagement.backend.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.propertymanagement.backend.entity.LeaseAgreement;
import com.propertymanagement.backend.enums.LeaseStatus;
import com.propertymanagement.backend.enums.Role;
import com.propertymanagement.backend.exception.ResourceNotFoundException;
import com.propertymanagement.backend.repository.LeaseRepository;
import com.propertymanagement.backend.repository.PropertyRepository;
import com.propertymanagement.backend.repository.UserRepository;
import com.propertymanagement.backend.service.LeaseService;

@Service
public class LeaseServiceImpl implements LeaseService {

    private final LeaseRepository leaseRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    public LeaseServiceImpl(LeaseRepository leaseRepository, UserRepository userRepository, PropertyRepository propertyRepository) {
        this.leaseRepository = leaseRepository;
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
    }

    @Override
    public LeaseAgreement requestLease(LeaseAgreement lease) {
        // Check if tenant already has an active or approved lease (allow only ONE lease at a time)
        if (lease.getTenant() != null && lease.getTenant().getId() != null) {
            java.util.List<LeaseStatus> blockingStatuses = java.util.Arrays.asList(
                LeaseStatus.REQUESTED,
                LeaseStatus.APPROVED,
                LeaseStatus.ACTIVE
            );
            java.util.List<LeaseAgreement> existingLeases = leaseRepository.findByTenant_IdAndLeaseStatusIn(
                lease.getTenant().getId(),
                blockingStatuses
            );
            if (!existingLeases.isEmpty()) {
                throw new IllegalArgumentException(
                    "You can only have one active or pending lease at a time. "
                    + "Complete or cancel your existing lease before requesting a new one."
                );
            }
        }
        
        lease.setLeaseStatus(LeaseStatus.REQUESTED);
        // Resolve tenant and property references from DB to ensure correct foreign keys
        try {
            if (lease.getTenant() != null && lease.getTenant().getId() != null) {
                userRepository.findById(lease.getTenant().getId()).ifPresent(lease::setTenant);
            }
        } catch (Exception ignored) {}

        try {
            if (lease.getProperty() != null && lease.getProperty().getId() != null) {
                propertyRepository.findById(lease.getProperty().getId()).ifPresent(lease::setProperty);
            }
        } catch (Exception ignored) {}

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
    public LeaseAgreement approveLease(Long id, Long approvedById, java.time.LocalDate leaseStart, java.time.LocalDate leaseEnd) {
        LeaseAgreement lease = getLeaseById(id);
        lease.setLeaseStatus(LeaseStatus.APPROVED);

        // set approvedBy if provided
        if (approvedById != null) {
            userRepository.findById(approvedById).ifPresent(lease::setApprovedBy);
        }

        // set lease start and end dates; if not provided, default to today -> +12 months
        java.time.LocalDate start = leaseStart != null ? leaseStart : java.time.LocalDate.now();
        java.time.LocalDate end = leaseEnd != null ? leaseEnd : start.plusMonths(12);
        lease.setLeaseStartDate(start);
        lease.setLeaseEndDate(end);

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

    @Override
    public java.util.List<LeaseAgreement> fixMissingApprovedLeases() {
        java.util.List<LeaseAgreement> fixed = new java.util.ArrayList<>();
        java.util.List<LeaseAgreement> all = leaseRepository.findAll();
        for (LeaseAgreement lease : all) {
            if (lease.getLeaseStatus() == LeaseStatus.APPROVED) {
                boolean changed = false;
                // set approvedBy if missing
                if (lease.getApprovedBy() == null) {
                    try {
                        if (lease.getProperty() != null && lease.getProperty().getOwner() != null) {
                            lease.setApprovedBy(lease.getProperty().getOwner());
                            changed = true;
                        } else {
                            // try to find a lease manager or admin
                            java.util.List<com.propertymanagement.backend.entity.User> managers = userRepository.findByRole(Role.LEASE_MANAGER);
                            if (!managers.isEmpty()) {
                                lease.setApprovedBy(managers.get(0));
                                changed = true;
                            } else {
                                java.util.List<com.propertymanagement.backend.entity.User> admins = userRepository.findByRole(Role.ADMIN);
                                if (!admins.isEmpty()) {
                                    lease.setApprovedBy(admins.get(0));
                                    changed = true;
                                }
                            }
                        }
                    } catch (Exception ignored) {}
                }

                // set start/end dates if missing
                if (lease.getLeaseStartDate() == null) {
                    java.time.LocalDate start = lease.getCreatedAt() != null ? lease.getCreatedAt().toLocalDate() : java.time.LocalDate.now();
                    lease.setLeaseStartDate(start);
                    changed = true;
                }
                if (lease.getLeaseEndDate() == null) {
                    java.time.LocalDate end = lease.getLeaseStartDate().plusMonths(12);
                    lease.setLeaseEndDate(end);
                    changed = true;
                }

                if (changed) {
                    leaseRepository.save(lease);
                    fixed.add(lease);
                }
            }
        }
        return fixed;
    }
}