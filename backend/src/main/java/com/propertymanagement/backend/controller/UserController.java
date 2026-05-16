package com.propertymanagement.backend.controller;

import com.propertymanagement.backend.dto.AuthRequest;
import com.propertymanagement.backend.entity.User;
import com.propertymanagement.backend.enums.Role;
import com.propertymanagement.backend.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")

public class UserController {

    @Autowired
    private UserService userService;


    @PostMapping
    public User createUser(
            @RequestBody AuthRequest request) {

        return userService.createUser(request);
    }


    @GetMapping
    public List<User> getUsers(
            @RequestParam(required = false) Role role) {

        if (role == null) {
            return userService.getAllUsers();
        }

        return userService.getUsersByRole(role);
    }


    @GetMapping("/{id}")
    public User getUserById(
            @PathVariable Long id){

        return userService.getUserById(id);
    }
}