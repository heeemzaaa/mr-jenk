package com.ecommerce.userservice.dto.response;

import com.ecommerce.userservice.model.User;

import com.ecommerce.userservice.enums.UserRole;

public record UserResponse(
		String id,
		String name,
		String email,
		UserRole role) {
	public static UserResponse from(User user) {
		return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
	}
}