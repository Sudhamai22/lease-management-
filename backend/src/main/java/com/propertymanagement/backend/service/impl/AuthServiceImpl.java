package com.propertymanagement.backend.service.impl;

import java.time.LocalDateTime;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.propertymanagement.backend.dto.AuthRequest;
import com.propertymanagement.backend.dto.AuthResponse;
import com.propertymanagement.backend.entity.User;
import com.propertymanagement.backend.enums.Role;
import com.propertymanagement.backend.exception.ResourceNotFoundException;
import com.propertymanagement.backend.repository.UserRepository;
import com.propertymanagement.backend.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    public AuthServiceImpl(
            UserRepository userRepository) {

        this.userRepository = userRepository;
    }

    @Override
    public AuthResponse register(AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
            .password(request.getPassword())
                .role(resolveRole(request.getRole()))
                .phoneNumber(request.getPhoneNumber())
                .createdAt(LocalDateTime.now())
                .build();

        User saved = userRepository.save(user);
        return new AuthResponse("User registered successfully", saved.getId(), saved.getName(), saved.getEmail(), saved.getRole().name(), saved.getPhoneNumber());
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + request.getEmail()));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        return new AuthResponse("Login successful", user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.getPhoneNumber());
    }

    private Role resolveRole(String role) {
        if (role == null || role.isBlank()) {
            return Role.TENANT;
        }

        return Role.valueOf(role.trim().toUpperCase(Locale.ROOT));
    }
}