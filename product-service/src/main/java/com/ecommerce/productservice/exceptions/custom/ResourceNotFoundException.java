package com.ecommerce.productservice.exceptions.custom;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resourceType, String id) {
        super(resourceType + " not found: " + id);
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}