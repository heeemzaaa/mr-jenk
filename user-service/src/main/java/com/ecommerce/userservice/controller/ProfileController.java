package com.ecommerce.userservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.userservice.dto.request.UpdateProfileRequest;
import com.ecommerce.userservice.dto.response.ApiResponse;
import com.ecommerce.userservice.dto.response.ProfileResponse;
import com.ecommerce.userservice.service.ProfileService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/MyProfile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(
            @RequestHeader("X-User-Id") String userId) {

        ProfileResponse profile = profileService.getProfile(userId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Profile retrieved successfully",
                        profile));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody UpdateProfileRequest request) {

        ProfileResponse profile = profileService.updateProfile(userId, request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Profile updated successfully",
                        profile));
    }
}