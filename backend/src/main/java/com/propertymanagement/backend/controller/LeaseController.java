package com.propertymanagement.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.propertymanagement.backend.entity.LeaseAgreement;
import com.propertymanagement.backend.service.LeaseService;

@RestController
@RequestMapping("/api/leases")

public class LeaseController {

    @Autowired
    private LeaseService leaseService;


    @PostMapping
    public LeaseAgreement createLease(
            @RequestBody LeaseAgreement lease) {

        return leaseService.saveLease(lease);
    }


    @PostMapping("/request")
    public LeaseAgreement requestLease(
            @RequestBody LeaseAgreement lease){

        return leaseService.requestLease(lease);
    }


    @PutMapping("/{id}/approve")
    public LeaseAgreement approveLease(
            @PathVariable Long id,
            @RequestBody(required = false) LeaseAgreement payload) {

        Long approvedById = null;
        if (payload != null && payload.getApprovedBy() != null) approvedById = payload.getApprovedBy().getId();
        return leaseService.approveLease(id, approvedById, payload != null ? payload.getLeaseStartDate() : null, payload != null ? payload.getLeaseEndDate() : null);
    }


    @GetMapping
    public List<LeaseAgreement> getAllLeases(){

        return leaseService.getAllLeases();
    }


    @GetMapping("/{id}")
    public LeaseAgreement getLeaseById(
            @PathVariable Long id){

        return leaseService.getLeaseById(id);
    }

    @PutMapping("/fix-missing-approved")
    public java.util.List<LeaseAgreement> fixMissingApprovedLeases(){
        return leaseService.fixMissingApprovedLeases();
    }
}