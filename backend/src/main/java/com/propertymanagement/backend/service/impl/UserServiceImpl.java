package com.propertymanagement.backend.service.impl;

import com.propertymanagement.backend.dto.AuthRequest;
import com.propertymanagement.backend.entity.User;
import com.propertymanagement.backend.enums.Role;
import com.propertymanagement.backend.exception.ResourceNotFoundException;
import com.propertymanagement.backend.repository.UserRepository;
import com.propertymanagement.backend.service.UserService;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User createUser(AuthRequest request) {
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
            .password(request.getPassword())
                .role(resolveRole(request.getRole()))
                .phoneNumber(request.getPhoneNumber())
                .createdAt(LocalDateTime.now())
                .build();

        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private Role resolveRole(String role) {
        if (role == null || role.isBlank()) {
            return Role.TENANT;
        }

        return Role.valueOf(role.trim().toUpperCase());
    }
}