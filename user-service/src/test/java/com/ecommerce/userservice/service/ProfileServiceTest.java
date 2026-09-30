package com.ecommerce.userservice.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

import com.ecommerce.userservice.dto.request.UpdateProfileRequest;
import com.ecommerce.userservice.dto.response.ProfileResponse;
import com.ecommerce.userservice.enums.UserRole;
import com.ecommerce.userservice.exception.ResourceNotFoundException;
import com.ecommerce.userservice.model.User;
import com.ecommerce.userservice.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ProfileService profileService;

    private User user;

    @BeforeEach
    void setUp() {

        user = User.builder()
                .id("user-123")
                .name("Youssef")
                .email("youssef@example.com")
                .password("hashed-password")
                .role(UserRole.CLIENT)
                .avatar(null)
                .build();
    }

    // =========================================================
    // GET PROFILE
    // =========================================================

    @Test
    void shouldGetProfileSuccessfully() {

        when(userRepository.findById("user-123"))
                .thenReturn(Optional.of(user));

        ProfileResponse response =
                profileService.getProfile("user-123");

        assertEquals("Youssef", response.getName());
        assertEquals("youssef@example.com", response.getEmail());
        assertEquals(UserRole.CLIENT, response.getRole());
        assertEquals(null, response.getAvatar());

        verify(userRepository).findById("user-123");
    }

    @Test
    void shouldThrowExceptionWhenGettingProfileForUnknownUser() {

        when(userRepository.findById("unknown-id"))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> profileService.getProfile("unknown-id")
        );

        verify(userRepository).findById("unknown-id");
    }

    // =========================================================
    // UPDATE PROFILE
    // =========================================================

    @Test
    void shouldUpdateNameAndEmailSuccessfully() {

        UpdateProfileRequest request = new UpdateProfileRequest();

        request.setName("Youssef Jaouhar");
        request.setEmail("youssef.new@example.com");
        request.setNewPassword(null);

        when(userRepository.findById("user-123"))
                .thenReturn(Optional.of(user));

        when(userRepository.findByEmail("youssef.new@example.com"))
                .thenReturn(Optional.empty());

        when(userRepository.save(any(User.class)))
                .thenReturn(user);

        ProfileResponse response =
                profileService.updateProfile(
                        "user-123",
                        request
                );

        assertEquals("Youssef Jaouhar", user.getName());
        assertEquals(
                "youssef.new@example.com",
                user.getEmail()
        );

        assertEquals("Youssef Jaouhar", response.getName());
        assertEquals(
                "youssef.new@example.com",
                response.getEmail()
        );

        verify(userRepository).findById("user-123");

        verify(userRepository).findByEmail(
                "youssef.new@example.com"
        );

        verify(userRepository).save(user);

        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void shouldUpdatePasswordWhenNewPasswordIsProvided() {

        UpdateProfileRequest request = new UpdateProfileRequest();

        request.setName("Youssef");
        request.setEmail("youssef@example.com");
        request.setNewPassword("newPassword123");

        when(userRepository.findById("user-123"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.encode("newPassword123"))
                .thenReturn("new-hashed-password");

        when(userRepository.save(any(User.class)))
                .thenReturn(user);

        ProfileResponse response =
                profileService.updateProfile(
                        "user-123",
                        request
                );

        assertEquals(
                "new-hashed-password",
                user.getPassword()
        );

        assertEquals(
                "Youssef",
                response.getName()
        );

        verify(passwordEncoder)
                .encode("newPassword123");

        verify(userRepository)
                .save(user);

        verify(userRepository, never())
                .findByEmail(any());
    }

    @Test
    void shouldNotUpdatePasswordWhenPasswordIsBlank() {

        UpdateProfileRequest request = new UpdateProfileRequest();

        request.setName("Youssef");
        request.setEmail("youssef@example.com");
        request.setNewPassword("   ");

        when(userRepository.findById("user-123"))
                .thenReturn(Optional.of(user));

        when(userRepository.save(any(User.class)))
                .thenReturn(user);

        profileService.updateProfile(
                "user-123",
                request
        );

        assertEquals(
                "hashed-password",
                user.getPassword()
        );

        verify(passwordEncoder, never())
                .encode(anyString());

        verify(userRepository)
                .save(user);
    }

    @Test
    void shouldNotUpdatePasswordWhenPasswordIsNull() {

        UpdateProfileRequest request = new UpdateProfileRequest();

        request.setName("Youssef");
        request.setEmail("youssef@example.com");
        request.setNewPassword(null);

        when(userRepository.findById("user-123"))
                .thenReturn(Optional.of(user));

        when(userRepository.save(any(User.class)))
                .thenReturn(user);

        profileService.updateProfile(
                "user-123",
                request
        );

        assertEquals(
                "hashed-password",
                user.getPassword()
        );

        verifyNoInteractions(passwordEncoder);

        verify(userRepository)
                .save(user);
    }

    // =========================================================
    // EMAIL VALIDATION
    // =========================================================

    @Test
    void shouldRejectEmailAlreadyInUse() {

        UpdateProfileRequest request = new UpdateProfileRequest();

        request.setName("Youssef");
        request.setEmail("another@example.com");
        request.setNewPassword(null);

        User existingUser = User.builder()
                .id("another-user")
                .name("Another User")
                .email("another@example.com")
                .role(UserRole.CLIENT)
                .build();

        when(userRepository.findById("user-123"))
                .thenReturn(Optional.of(user));

        when(userRepository.findByEmail("another@example.com"))
                .thenReturn(Optional.of(existingUser));

        assertThrows(
                IllegalArgumentException.class,
                () -> profileService.updateProfile(
                        "user-123",
                        request
                )
        );

        verify(userRepository, never())
                .save(any(User.class));

        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void shouldNotCheckEmailWhenEmailIsSameIgnoringCase() {

        UpdateProfileRequest request = new UpdateProfileRequest();

        request.setName("New Name");
        request.setEmail("YOUSSEF@EXAMPLE.COM");
        request.setNewPassword(null);

        when(userRepository.findById("user-123"))
                .thenReturn(Optional.of(user));

        when(userRepository.save(any(User.class)))
                .thenReturn(user);

        profileService.updateProfile(
                "user-123",
                request
        );

        assertEquals(
                "New Name",
                user.getName()
        );

        verify(userRepository, never())
                .findByEmail(any());

        verify(userRepository)
                .save(user);
    }

    // =========================================================
    // USER NOT FOUND
    // =========================================================

    @Test
    void shouldThrowExceptionWhenUpdatingUnknownUser() {

        UpdateProfileRequest request = new UpdateProfileRequest();

        request.setName("Youssef");
        request.setEmail("youssef@example.com");
        request.setNewPassword(null);

        when(userRepository.findById("unknown-id"))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> profileService.updateProfile(
                        "unknown-id",
                        request
                )
        );

        verify(userRepository)
                .findById("unknown-id");

        verify(userRepository, never())
                .save(any(User.class));

        verifyNoInteractions(passwordEncoder);
    }
}