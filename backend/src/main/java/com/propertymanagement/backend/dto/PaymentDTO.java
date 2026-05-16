package com.propertymanagement.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class PaymentDTO {

    private Long leaseId;

    private Double amount;

    private String paymentMonth;

    private String referenceId;
}