package com.ecommerce.userservice.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecommerce.userservice.dto.request.UpdateProfileRequest;
import com.ecommerce.userservice.dto.response.ProfileResponse;
import com.ecommerce.userservice.exception.ResourceNotFoundException;
import com.ecommerce.userservice.model.User;
import com.ecommerce.userservice.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileResponse getProfile(String userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return mapToProfileResponse(user);
    }

    public ProfileResponse updateProfile(
            String userId,
            UpdateProfileRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if email is being changed
        if (!user.getEmail().equalsIgnoreCase(request.getEmail())) {

            userRepository.findByEmail(request.getEmail())
                    .ifPresent(existingUser -> {
                        throw new IllegalArgumentException(
                                "Email is already in use");
                    });

            user.setEmail(request.getEmail());
        }

        user.setName(request.getName());

        if (request.getAvatar() != "" && request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }

        // Password is optional
        if (request.getNewPassword() != null
                && !request.getNewPassword().isBlank()) {

            user.setPassword(
                    passwordEncoder.encode(request.getNewPassword()));
        }

        User updatedUser = userRepository.save(user);

        return mapToProfileResponse(updatedUser);
    }

    private ProfileResponse mapToProfileResponse(User user) {

        return ProfileResponse.builder()
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .avatar(user.getAvatar())
                .build();
    }
}