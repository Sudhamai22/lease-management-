package com.propertymanagement.backend.entity;

import com.propertymanagement.backend.enums.DisputeStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "disputes")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Dispute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "lease_id")
    private LeaseAgreement leaseAgreement;


    @ManyToOne
    @JoinColumn(name = "raised_by")
    private User raisedBy;


    @Column(name = "dispute_reason")
    private String disputeReason;


    @Enumerated(EnumType.STRING)
    @Column(name = "dispute_status")
    private DisputeStatus disputeStatus;


    @Column(name = "resolution_remarks")
    private String resolutionRemarks;


    @ManyToOne
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;


    @Column(name = "created_at")
    private LocalDateTime createdAt;


    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}