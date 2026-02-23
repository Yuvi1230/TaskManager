package com.taskmanager.service;

import com.taskmanager.dto.auth.LoginRequest;
import com.taskmanager.dto.auth.RegisterRequest;
import com.taskmanager.model.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setFullName("John Doe");
        registerRequest.setEmail("john@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setConfirmPassword("password123");
    }

    @Test
    void registerShouldThrowWhenEmailAlreadyExists() {
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> authService.register(registerRequest));

        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void loginShouldReturnTokenWhenCredentialsAreValid() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("john@example.com");
        loginRequest.setPassword("password123");

        User user = new User();
        user.setEmail("john@example.com");
        user.setFullName("John Doe");
        user.setPasswordHash("hashed");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed")).thenReturn(true);
        when(jwtService.generateToken("john@example.com")).thenReturn("token-123");

        var response = authService.login(loginRequest);

        assertEquals("token-123", response.getToken());
        assertEquals("john@example.com", response.getEmail());
    }
}
