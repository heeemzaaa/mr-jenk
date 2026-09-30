package com.ecommerce.userservice.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ecommerce.userservice.dto.request.LoginRequest;
import com.ecommerce.userservice.dto.request.RegisterRequest;
import com.ecommerce.userservice.dto.response.ApiResponse;
import com.ecommerce.userservice.enums.UserRole;
import com.ecommerce.userservice.model.User;
import com.ecommerce.userservice.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {

        user = User.builder()
                .id("user-123")
                .name("Youssef")
                .email("youssef@example.com")
                .password("hashed-password")
                .role(UserRole.CLIENT)
                .build();
    }

    @Test
    void shouldLoginSuccessfully() {

        LoginRequest request = new LoginRequest();

        request.setEmail(" YOUSSEF@EXAMPLE.COM ");
        request.setPassword("password123");

        when(userRepository.findByEmail("youssef@example.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "password123",
                "hashed-password"
        )).thenReturn(true);

        when(jwtService.generateToken(user))
                .thenReturn("jwt-token");

        ApiResponse<String> response =
                authService.login(request);

        assertTrue(response.isSuccess());
        assertEquals(
                "Login successful",
                response.getMessage()
        );
        assertEquals(
                "jwt-token",
                response.getData()
        );

        verify(userRepository)
                .findByEmail("youssef@example.com");

        verify(passwordEncoder)
                .matches(
                        "password123",
                        "hashed-password"
                );

        verify(jwtService)
                .generateToken(user);
    }

    @Test
    void shouldRejectLoginWhenUserDoesNotExist() {

        LoginRequest request = new LoginRequest();

        request.setEmail("unknown@example.com");
        request.setPassword("password123");

        when(userRepository.findByEmail("unknown@example.com"))
                .thenReturn(Optional.empty());

        assertThrows(
                BadCredentialsException.class,
                () -> authService.login(request)
        );
    }

    @Test
    void shouldRejectLoginWhenPasswordIsIncorrect() {

        LoginRequest request = new LoginRequest();

        request.setEmail("youssef@example.com");
        request.setPassword("wrong-password");

        when(userRepository.findByEmail("youssef@example.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "wrong-password",
                "hashed-password"
        )).thenReturn(false);

        assertThrows(
                BadCredentialsException.class,
                () -> authService.login(request)
        );
    }

    @Test
    void shouldRegisterSuccessfully() {

        RegisterRequest request = new RegisterRequest();

        request.setName(" Youssef ");
        request.setEmail(" YOUSSEF@EXAMPLE.COM ");
        request.setPassword("password123");
        request.setRole(UserRole.CLIENT);

        when(userRepository.findByEmail("youssef@example.com"))
                .thenReturn(Optional.empty());

        when(passwordEncoder.encode("password123"))
                .thenReturn("hashed-password");

        ApiResponse<Void> response =
                authService.register(request);

        assertTrue(response.isSuccess());

        assertEquals(
                "User registered successfully",
                response.getMessage()
        );

        assertEquals(
                null,
                response.getData()
        );

        verify(passwordEncoder)
                .encode("password123");

        verify(userRepository)
                .save(any(User.class));
    }

    @Test
    void shouldRejectRegistrationWhenEmailAlreadyExists() {

        RegisterRequest request = new RegisterRequest();

        request.setName("Youssef");
        request.setEmail("youssef@example.com");
        request.setPassword("password123");
        request.setRole(UserRole.CLIENT);

        when(userRepository.findByEmail("youssef@example.com"))
                .thenReturn(Optional.of(user));

        assertThrows(
                IllegalArgumentException.class,
                () -> authService.register(request)
        );
    }
}