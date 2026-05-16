package com.propertymanagement.backend.service.impl;

import com.propertymanagement.backend.entity.Dispute;
import com.propertymanagement.backend.enums.DisputeStatus;
import com.propertymanagement.backend.exception.ResourceNotFoundException;
import com.propertymanagement.backend.repository.DisputeRepository;
import com.propertymanagement.backend.service.DisputeService;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class DisputeServiceImpl implements DisputeService {

    private final DisputeRepository disputeRepository;

    public DisputeServiceImpl(DisputeRepository disputeRepository) {
        this.disputeRepository = disputeRepository;
    }

    @Override
    public Dispute resolveDispute(Long id) {
        Dispute dispute = getDisputeById(id);
        dispute.setDisputeStatus(DisputeStatus.RESOLVED);
        dispute.setResolvedAt(LocalDateTime.now());
        return disputeRepository.save(dispute);
    }

    @Override
    public Dispute saveDispute(Dispute dispute) {
        if (dispute.getCreatedAt() == null) {
            dispute.setCreatedAt(LocalDateTime.now());
        }
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