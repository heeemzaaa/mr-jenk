package com.ecommerce.userservice.service;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecommerce.userservice.dto.request.LoginRequest;
import com.ecommerce.userservice.dto.request.RegisterRequest;
import com.ecommerce.userservice.dto.response.ApiResponse;
import com.ecommerce.userservice.model.User;
import com.ecommerce.userservice.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;

        public ApiResponse<String> login(LoginRequest request) {

                String email = request.getEmail()
                                .trim()
                                .toLowerCase();

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new BadCredentialsException(
                                                "Invalid email or password"));

                if (!passwordEncoder.matches(
                                request.getPassword(),
                                user.getPassword())) {

                        throw new BadCredentialsException(
                                        "Invalid email or password");
                }

                String token = jwtService.generateToken(user);

                return ApiResponse.success(
                                "Login successful",
                                token);
        }

        public ApiResponse<Void> register(RegisterRequest request) {

                String email = request.getEmail()
                                .trim()
                                .toLowerCase();

                String name = request.getName()
                                .trim();

                if (userRepository.findByEmail(email).isPresent()) {
                        throw new IllegalArgumentException("Email already exists");
                }

                User user = User.builder()
                                .name(name)
                                .email(email)
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(request.getRole())
                                .build();

                userRepository.save(user);

                return ApiResponse.success(
                                "User registered successfully",
                                null);
        }
}