package com.propertymanagement.backend.service;

import com.propertymanagement.backend.entity.Dispute;

import java.util.List;

public interface DisputeService {

    Dispute resolveDispute(Long id);

    Dispute saveDispute(Dispute dispute);

    List<Dispute> getAllDisputes();

    Dispute getDisputeById(Long id);

}