package com.ecommerce.userservice.dto.response;

import com.ecommerce.userservice.enums.UserRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ProfileResponse {

    private String name;

    private String email;

    private UserRole role;

    private String avatar;
}