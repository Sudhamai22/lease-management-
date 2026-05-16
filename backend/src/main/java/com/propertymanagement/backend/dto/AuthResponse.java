package com.propertymanagement.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class AuthResponse {
    private String message;
    private Long userId;
    private String name;
    private String email;
    private String role;
    private String phoneNumber;
}