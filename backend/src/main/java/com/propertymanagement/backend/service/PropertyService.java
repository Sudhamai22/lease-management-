package com.propertymanagement.backend.service;

import com.propertymanagement.backend.entity.Property;

import java.util.List;

public interface PropertyService {

    Property saveProperty(Property property);

    List<Property> getAllProperties();

    Property getPropertyById(Long id);

}