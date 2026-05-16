package com.propertymanagement.backend.entity;

import com.propertymanagement.backend.enums.PropertyStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "properties")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "property_name")
    private String propertyName;


    private String location;


    @Column(name = "property_type")
    private String propertyType;


    @Column(name = "monthly_rent_amount")
    private Double monthlyRentAmount;


    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;


    @Enumerated(EnumType.STRING)
    @Column(name = "availability_status")
    private PropertyStatus availabilityStatus;


    @Column(name = "created_at")
    private LocalDateTime createdAt;
}