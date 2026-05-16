package com.propertymanagement.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class LeaseDTO {

    private Long propertyId;

    private Long tenantId;

    private String leaseStartDate;

    private String leaseEndDate;

    private Double monthlyRentAmount;

    private Double securityDeposit;
}