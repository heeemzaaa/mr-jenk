package com.ecommerce.userservice.dto.response;

import com.ecommerce.userservice.enums.UserRole;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RegisterResponse {

    private String id;
    private String name;
    private String email;
    private UserRole role;
    private String avatar;
}