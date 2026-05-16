package com.propertymanagement.backend.controller;

import com.propertymanagement.backend.entity.Dispute;
import com.propertymanagement.backend.service.DisputeService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/disputes")

public class DisputeController {

    @Autowired
    private DisputeService disputeService;


    @PostMapping
    public Dispute raiseDispute(
            @RequestBody Dispute dispute){

        return disputeService.saveDispute(dispute);
    }


    @PutMapping("/{id}/resolve")
    public Dispute resolveDispute(
            @PathVariable Long id) {

        return disputeService.resolveDispute(id);
    }


    @GetMapping
    public List<Dispute> getAllDisputes(){

        return disputeService.getAllDisputes();
    }


    @GetMapping("/{id}")
    public Dispute getDisputeById(
            @PathVariable Long id){

        return disputeService.getDisputeById(id);
    }
}