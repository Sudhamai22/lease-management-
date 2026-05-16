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

import com.propertymanagement.backend.entity.Property;
import com.propertymanagement.backend.service.PropertyService;

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

    @PutMapping("/{id}")
    public Property updateProperty(@PathVariable Long id, @RequestBody Property property){
        property.setId(id);
        return propertyService.saveProperty(property);
    }
}