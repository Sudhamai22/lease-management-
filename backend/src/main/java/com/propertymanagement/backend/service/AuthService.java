package com.propertymanagement.backend.service;

import com.propertymanagement.backend.dto.AuthRequest;
import com.propertymanagement.backend.dto.AuthResponse;

public interface AuthService {

    AuthResponse register(AuthRequest request);

    AuthResponse login(AuthRequest request);

}