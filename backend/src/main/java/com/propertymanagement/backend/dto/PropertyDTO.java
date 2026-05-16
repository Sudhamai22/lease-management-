package com.propertymanagement.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class PropertyDTO {

    private String propertyName;

    private String location;

    private String propertyType;

    private Double monthlyRentAmount;

    private Long ownerId;
}