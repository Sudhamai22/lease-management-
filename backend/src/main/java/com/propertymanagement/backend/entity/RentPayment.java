package com.propertymanagement.backend.entity;

import com.propertymanagement.backend.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "rent_payments")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class RentPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "lease_id")
    private LeaseAgreement leaseAgreement;


    private Double amount;


    @Column(name = "payment_month")
    private String paymentMonth;


    @Column(name = "payment_date")
    private LocalDate paymentDate;


    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus;


    @Column(name = "penalty_amount")
    private Double penaltyAmount;


    @Column(name = "reference_id")
    private String referenceId;


    @Column(name = "created_at")
    private LocalDateTime createdAt;
}