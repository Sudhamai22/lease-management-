package com.propertymanagement.backend.util;

import com.propertymanagement.backend.dto.*;
import com.propertymanagement.backend.entity.*;

public class MapperUtil {


    private MapperUtil() {
    }


    public static AuthResponse mapToAuthResponse(
            String message){

        return new AuthResponse(message);
    }


    public static PropertyDTO mapToPropertyDTO(
            Property property){

        return new PropertyDTO(

                property.getPropertyName(),

                property.getLocation(),

                property.getPropertyType(),

                property.getMonthlyRentAmount(),

                property.getOwner().getId()
        );
    }


    public static LeaseDTO mapToLeaseDTO(
            LeaseAgreement lease){

        return new LeaseDTO(

                lease.getProperty().getId(),

                lease.getTenant().getId(),

                lease.getLeaseStartDate().toString(),

                lease.getLeaseEndDate().toString(),

                lease.getMonthlyRentAmount(),

                lease.getSecurityDeposit()
        );
    }


    public static PaymentDTO mapToPaymentDTO(
            RentPayment payment){

        return new PaymentDTO(

                payment.getLeaseAgreement().getId(),

                payment.getAmount(),

                payment.getPaymentMonth(),

                payment.getReferenceId()
        );
    }


    public static DisputeDTO mapToDisputeDTO(
            Dispute dispute){

        return new DisputeDTO(

                dispute.getLeaseAgreement().getId(),

                dispute.getRaisedBy().getId(),

                dispute.getDisputeReason()
        );
    }

}