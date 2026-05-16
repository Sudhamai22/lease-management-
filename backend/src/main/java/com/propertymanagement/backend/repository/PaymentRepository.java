package com.propertymanagement.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.propertymanagement.backend.entity.RentPayment;

public interface PaymentRepository
        extends JpaRepository<RentPayment, Long> {

        List<RentPayment> findByLeaseAgreement_Id(Long leaseId);
        List<RentPayment> findByLeaseAgreement_Tenant_Id(Long tenantId);

}