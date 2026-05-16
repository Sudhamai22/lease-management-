package com.propertymanagement.backend.controller;

import com.propertymanagement.backend.entity.Property;
import com.propertymanagement.backend.service.PropertyService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")

public class PropertyController {

    @Autowired
    private PropertyService propertyService;


    @PostMapping
    public Property addProperty(
            @RequestBody Property property){

        return propertyService.saveProperty(property);
    }


    @GetMapping
    public List<Property> getAllProperties(){

        return propertyService.getAllProperties();
    }


    @GetMapping("/{id}")
    public Property getById(
            @PathVariable Long id){

        return propertyService.getPropertyById(id);
    }
}