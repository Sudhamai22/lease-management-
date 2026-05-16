package com.propertymanagement.backend.controller;

import com.propertymanagement.backend.entity.LeaseAgreement;
import com.propertymanagement.backend.service.LeaseService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            @PathVariable Long id) {

        return leaseService.approveLease(id);
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
}