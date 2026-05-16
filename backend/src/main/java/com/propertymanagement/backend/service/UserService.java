package com.propertymanagement.backend.service;

import com.propertymanagement.backend.dto.AuthRequest;
import com.propertymanagement.backend.entity.User;
import com.propertymanagement.backend.enums.Role;

import java.util.List;

public interface UserService {

    User createUser(AuthRequest request);

    List<User> getAllUsers();

    List<User> getUsersByRole(Role role);

    User getUserById(Long id);

}