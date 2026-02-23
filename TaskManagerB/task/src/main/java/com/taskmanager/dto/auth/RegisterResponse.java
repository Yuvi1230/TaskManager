package com.taskmanager.dto.auth;

public class RegisterResponse {
    private final String message;

    public RegisterResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
