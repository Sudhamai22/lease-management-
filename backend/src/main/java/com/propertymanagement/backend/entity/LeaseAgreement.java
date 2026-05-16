package com.propertymanagement.backend.entity;

import com.propertymanagement.backend.enums.LeaseStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "lease_agreements")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class LeaseAgreement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "property_id")
    private Property property;


    @ManyToOne
    @JoinColumn(name = "tenant_id")
    private User tenant;


    @Column(name = "lease_start_date")
    private LocalDate leaseStartDate;


    @Column(name = "lease_end_date")
    private LocalDate leaseEndDate;


    @Column(name = "monthly_rent_amount")
    private Double monthlyRentAmount;


    @Column(name = "security_deposit")
    private Double securityDeposit;


    @Enumerated(EnumType.STRING)
    @Column(name = "lease_status")
    private LeaseStatus leaseStatus;


    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;


    @Column(name = "created_at")
    private LocalDateTime createdAt;
}