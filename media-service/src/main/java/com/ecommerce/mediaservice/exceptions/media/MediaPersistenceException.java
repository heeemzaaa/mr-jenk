package com.ecommerce.mediaservice.exceptions.media;

public class MediaPersistenceException extends RuntimeException {
    public MediaPersistenceException(String message) {
        super(message);
    }

    public MediaPersistenceException(String message, Throwable cause) {
        super(message, cause);
    }
}
