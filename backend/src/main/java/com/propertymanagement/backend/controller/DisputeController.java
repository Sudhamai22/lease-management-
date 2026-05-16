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

import com.propertymanagement.backend.entity.Dispute;
import com.propertymanagement.backend.service.DisputeService;

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

    @PutMapping("/{id}/review")
    public Dispute reviewDispute(
            @PathVariable Long id,
            @RequestBody(required = false) Dispute payload) {

        String remarks = null;
        Long resolvedById = null;
        if (payload != null) {
            remarks = payload.getResolutionRemarks();
            if (payload.getResolvedBy() != null) resolvedById = payload.getResolvedBy().getId();
        }
        return disputeService.reviewDispute(id, remarks, resolvedById);
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