package com.ecommerce.mediaservice.exceptions.Product;

public class MoreThanFiveImagesException extends RuntimeException {

    public MoreThanFiveImagesException(String message) {
        super(message);
    }

}
