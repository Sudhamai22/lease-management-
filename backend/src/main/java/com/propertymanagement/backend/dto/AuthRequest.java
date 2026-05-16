package com.propertymanagement.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class AuthRequest {

    private String name;

    private String email;

    private String password;

    private String phoneNumber;

    private String role;
}