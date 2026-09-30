package com.ecommerce.productservice.dtos.response;

import java.time.LocalDateTime;
import java.util.Map;

public record ValidationErrorResponse(
        int status,
        String message,
        LocalDateTime timestamp,
        Map<String, String> errors
) {
    public static ValidationErrorResponse of(int status, String message, Map<String, String> errors) {
        return new ValidationErrorResponse(status, message, LocalDateTime.now(), errors);
    }
}