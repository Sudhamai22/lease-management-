package com.propertymanagement.backend.entity;

import com.propertymanagement.backend.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="users")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String name;


    @Column(unique = true)
    private String email;


    private String password;


    @Enumerated(EnumType.STRING)
    private Role role;


    @Column(name = "phone_number")
    private String phoneNumber;


    @Column(name = "created_at")
    private LocalDateTime createdAt;
}