package com.propertymanagement.backend.service;

import com.propertymanagement.backend.entity.RentPayment;

import java.util.List;

public interface PaymentService {

    List<RentPayment> getPaymentsByLeaseId(Long leaseId);

    RentPayment savePayment(RentPayment payment);

    List<RentPayment> getAllPayments();

    RentPayment getPaymentById(Long id);

}