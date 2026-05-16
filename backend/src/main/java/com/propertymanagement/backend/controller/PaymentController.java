package com.propertymanagement.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.propertymanagement.backend.entity.RentPayment;
import com.propertymanagement.backend.service.PaymentService;

@RestController
@RequestMapping("/api/payments")

public class PaymentController {

    @Autowired
    private PaymentService paymentService;


    @PostMapping
    public RentPayment makePayment(
            @RequestBody RentPayment payment){

        return paymentService.savePayment(payment);
    }


    @GetMapping
    public List<RentPayment> getPayments(
            @RequestParam(required = false) Long leaseId,
            @RequestParam(required = false) Long tenantId) {

        if (tenantId != null) {
            return paymentService.getPaymentsByTenantId(tenantId);
        }

        if (leaseId != null) {
            return paymentService.getPaymentsByLeaseId(leaseId);
        }

        return paymentService.getAllPayments();
    }


    @GetMapping("/{id}")
    public RentPayment getPaymentById(
            @PathVariable Long id){

        return paymentService.getPaymentById(id);
    }
}