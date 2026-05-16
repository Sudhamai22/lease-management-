package com.propertymanagement.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class DisputeDTO {

    private Long leaseId;

    private Long raisedBy;

    private String disputeReason;
}