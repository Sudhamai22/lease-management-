package com.propertymanagement.backend.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.propertymanagement.backend.entity.Dispute;
import com.propertymanagement.backend.enums.DisputeStatus;
import com.propertymanagement.backend.exception.ResourceNotFoundException;
import com.propertymanagement.backend.repository.DisputeRepository;
import com.propertymanagement.backend.repository.LeaseRepository;
import com.propertymanagement.backend.repository.UserRepository;
import com.propertymanagement.backend.service.DisputeService;

@Service
public class DisputeServiceImpl implements DisputeService {

    private final DisputeRepository disputeRepository;
    private final UserRepository userRepository;
    private final LeaseRepository leaseRepository;

    public DisputeServiceImpl(DisputeRepository disputeRepository, UserRepository userRepository, LeaseRepository leaseRepository) {
        this.disputeRepository = disputeRepository;
        this.userRepository = userRepository;
        this.leaseRepository = leaseRepository;
    }

    @Override
    public Dispute resolveDispute(Long id) {
        Dispute dispute = getDisputeById(id);
        dispute.setDisputeStatus(DisputeStatus.RESOLVED);
        dispute.setResolvedAt(LocalDateTime.now());
        return disputeRepository.save(dispute);
    }

    @Override
    public Dispute reviewDispute(Long id, String remarks, Long resolvedById) {
        Dispute dispute = getDisputeById(id);
        dispute.setDisputeStatus(DisputeStatus.UNDER_REVIEW);
        if (remarks != null) dispute.setResolutionRemarks(remarks);
        if (resolvedById != null) {
            userRepository.findById(resolvedById).ifPresent(dispute::setResolvedBy);
        }
        return disputeRepository.save(dispute);
    }

    @Override
    public Dispute saveDispute(Dispute dispute) {
        if (dispute.getCreatedAt() == null) {
            dispute.setCreatedAt(LocalDateTime.now());
        }
        // Resolve references to ensure proper foreign keys
        try {
            if (dispute.getRaisedBy() != null && dispute.getRaisedBy().getId() != null) {
                userRepository.findById(dispute.getRaisedBy().getId()).ifPresent(dispute::setRaisedBy);
            }
        } catch (Exception ignored) {}

        try {
            if (dispute.getLeaseAgreement() != null && dispute.getLeaseAgreement().getId() != null) {
                leaseRepository.findById(dispute.getLeaseAgreement().getId()).ifPresent(dispute::setLeaseAgreement);
            }
        } catch (Exception ignored) {}

        return disputeRepository.save(dispute);
    }

    @Override
    public List<Dispute> getAllDisputes() {
        return disputeRepository.findAll();
    }

    @Override
    public Dispute getDisputeById(Long id) {
        return disputeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found with id: " + id));
    }
}