package com.propertymanagement.backend.controller;

import com.propertymanagement.backend.entity.RentPayment;
import com.propertymanagement.backend.service.PaymentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            @RequestParam(required = false) Long leaseId) {

        if (leaseId == null) {
            return paymentService.getAllPayments();
        }

        return paymentService.getPaymentsByLeaseId(leaseId);
    }


    @GetMapping("/{id}")
    public RentPayment getPaymentById(
            @PathVariable Long id){

        return paymentService.getPaymentById(id);
    }
}