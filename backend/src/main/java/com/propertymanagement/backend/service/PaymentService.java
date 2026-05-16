package com.propertymanagement.backend.service;

import java.util.List;

import com.propertymanagement.backend.entity.RentPayment;

public interface PaymentService {

    List<RentPayment> getPaymentsByLeaseId(Long leaseId);
    List<RentPayment> getPaymentsByTenantId(Long tenantId);

    RentPayment savePayment(RentPayment payment);

    List<RentPayment> getAllPayments();

    RentPayment getPaymentById(Long id);

}