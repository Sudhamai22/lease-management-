package com.propertymanagement.backend.repository;

import com.propertymanagement.backend.entity.Dispute;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DisputeRepository
        extends JpaRepository<Dispute, Long> {

        List<Dispute> findByLeaseAgreement_Id(Long leaseId);

}