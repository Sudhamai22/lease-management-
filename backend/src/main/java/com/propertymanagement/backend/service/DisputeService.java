package com.propertymanagement.backend.service;

import java.util.List;

import com.propertymanagement.backend.entity.Dispute;

public interface DisputeService {

    Dispute resolveDispute(Long id);

    Dispute reviewDispute(Long id, String remarks, Long resolvedById);

    Dispute saveDispute(Dispute dispute);

    List<Dispute> getAllDisputes();

    Dispute getDisputeById(Long id);

}