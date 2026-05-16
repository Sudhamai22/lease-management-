package com.propertymanagement.backend.repository;

import com.propertymanagement.backend.entity.RentPayment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository
        extends JpaRepository<RentPayment, Long> {

        List<RentPayment> findByLeaseAgreement_Id(Long leaseId);

}