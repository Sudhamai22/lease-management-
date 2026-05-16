package com.propertymanagement.backend.repository;

import com.propertymanagement.backend.entity.Property;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyRepository
        extends JpaRepository<Property, Long> {

}