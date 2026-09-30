package com.ecommerce.mediaservice.exceptions.media;

public class ImageNotFoundException extends RuntimeException {
    public ImageNotFoundException(String message) {
        super(message);
    }
}
