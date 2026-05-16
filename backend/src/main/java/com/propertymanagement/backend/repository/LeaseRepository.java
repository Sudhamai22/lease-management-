package com.propertymanagement.backend.repository;

import com.propertymanagement.backend.entity.LeaseAgreement;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaseRepository
        extends JpaRepository<LeaseAgreement, Long> {

}