package com.propertymanagement.backend.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.propertymanagement.backend.entity.RentPayment;
import com.propertymanagement.backend.exception.ResourceNotFoundException;
import com.propertymanagement.backend.repository.PaymentRepository;
import com.propertymanagement.backend.service.PaymentService;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Override
    public List<RentPayment> getPaymentsByLeaseId(Long leaseId) {
        return paymentRepository.findByLeaseAgreement_Id(leaseId);
    }

    @Override
    public List<RentPayment> getPaymentsByTenantId(Long tenantId) {
        return paymentRepository.findByLeaseAgreement_Tenant_Id(tenantId);
    }

    @Override
    public RentPayment savePayment(RentPayment payment) {
        if (payment.getCreatedAt() == null) {
            payment.setCreatedAt(LocalDateTime.now());
        }
        return paymentRepository.save(payment);
    }

    @Override
    public List<RentPayment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Override
    public RentPayment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
    }
}