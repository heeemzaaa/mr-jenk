package com.ecommerce.mediaservice.exceptions.media;

public class CloudinaryDeleteException extends RuntimeException {
    public CloudinaryDeleteException(String message) {
        super(message);
    }

    public CloudinaryDeleteException(String message, Throwable cause) {
        super(message, cause);
    }
}
