package com.propertymanagement.backend.controller;

import com.propertymanagement.backend.dto.AuthRequest;
import com.propertymanagement.backend.dto.AuthResponse;
import com.propertymanagement.backend.service.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")

public class AuthController {

    @Autowired
    private AuthService authService;


    @PostMapping("/register")
    public AuthResponse register(
            @RequestBody AuthRequest request){

        return authService.register(request);
    }


    @PostMapping("/login")
    public AuthResponse login(
            @RequestBody AuthRequest request){

        return authService.login(request);
    }
}