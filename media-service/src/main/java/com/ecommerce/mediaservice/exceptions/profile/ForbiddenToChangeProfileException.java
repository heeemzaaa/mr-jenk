package com.ecommerce.mediaservice.exceptions.profile;

public class ForbiddenToChangeProfileException extends RuntimeException {
    public ForbiddenToChangeProfileException(String message) {
        super(message);
    }
}
