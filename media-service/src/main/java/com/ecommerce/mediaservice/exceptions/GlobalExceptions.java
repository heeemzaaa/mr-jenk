package com.ecommerce.mediaservice.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.ecommerce.mediaservice.common.ResponseData;
import com.ecommerce.mediaservice.exceptions.Product.ForbiddenToChangeProductMediaException;
import com.ecommerce.mediaservice.exceptions.Product.MoreThanFiveImagesException;
import com.ecommerce.mediaservice.exceptions.Product.ProductNotFoundException;
import com.ecommerce.mediaservice.exceptions.Product.ProductServiceUnavailableException;
import com.ecommerce.mediaservice.exceptions.media.CloudinaryDeleteException;
import com.ecommerce.mediaservice.exceptions.media.CloudinaryUploadException;
import com.ecommerce.mediaservice.exceptions.media.ImageNotDeletedException;
import com.ecommerce.mediaservice.exceptions.media.ImageNotFoundException;
import com.ecommerce.mediaservice.exceptions.media.ImageNullOrEmptyException;
import com.ecommerce.mediaservice.exceptions.media.InvalidImageBodyException;
import com.ecommerce.mediaservice.exceptions.media.InvalidImageTypeException;
import com.ecommerce.mediaservice.exceptions.media.InvalidSizeLimitException;
import com.ecommerce.mediaservice.exceptions.media.MediaPersistenceException;
import com.ecommerce.mediaservice.exceptions.profile.ForbiddenToChangeProfileException;
import com.ecommerce.mediaservice.exceptions.profile.MoreThanOneImageException;

@RestControllerAdvice
public class GlobalExceptions {
    @ExceptionHandler(ImageNotFoundException.class)
    public ResponseEntity<ResponseData<Void>> handleImageNotFoundException(Exception ex) {
        return buildError(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(InvalidImageBodyException.class)
    public ResponseEntity<ResponseData<Void>> handleInvalidImageBodyException(Exception ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(ImageNullOrEmptyException.class)
    public ResponseEntity<ResponseData<Void>> handleImageNullOrEmptyException(Exception ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(InvalidImageTypeException.class)
    public ResponseEntity<ResponseData<Void>> handleInvalidImageTypeException(Exception ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(InvalidSizeLimitException.class)
    public ResponseEntity<ResponseData<Void>> handleInvalidSizeLimitException(Exception ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<ResponseData<Void>> handleProductNotFoundException(Exception ex) {
        return buildError(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(ProductServiceUnavailableException.class)
    public ResponseEntity<ResponseData<Void>> handleProductServiceUnavailableException(Exception ex) {
        return buildError(HttpStatus.BAD_GATEWAY, ex.getMessage());
    }

    @ExceptionHandler(CloudinaryUploadException.class)
    public ResponseEntity<ResponseData<Void>> handleCloudinaryUploadException(Exception ex) {
        return buildError(HttpStatus.BAD_GATEWAY, ex.getMessage());
    }

    @ExceptionHandler(CloudinaryDeleteException.class)
    public ResponseEntity<ResponseData<Void>> handleCloudinaryDeleteException(Exception ex) {
        return buildError(HttpStatus.BAD_GATEWAY, ex.getMessage());
    }

    @ExceptionHandler(MediaPersistenceException.class)
    public ResponseEntity<ResponseData<Void>> handleMediaPersistenceException(Exception ex) {
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
    }

    @ExceptionHandler(ForbiddenToChangeProfileException.class)
    public ResponseEntity<ResponseData<Void>> handleForbiddenToChangeProfileException(Exception ex) {
        return buildError(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(ForbiddenToChangeProductMediaException.class)
    public ResponseEntity<ResponseData<Void>> handleForbiddenToChangeProductMediaException(Exception ex) {
        return buildError(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(ImageNotDeletedException.class)
    public ResponseEntity<ResponseData<Void>> handleImageNotDeletedException(Exception ex) {
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ResponseData<Void>> handleMethodNotAllowedException(Exception ex) {
        return buildError(HttpStatus.METHOD_NOT_ALLOWED, "HTTP method not supported for this endpoint");
    }

    @ExceptionHandler(MoreThanFiveImagesException.class)
    public ResponseEntity<ResponseData<Void>> handleMoreThanFiveImagesException(Exception ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MoreThanOneImageException.class)
    public ResponseEntity<ResponseData<Void>> handleMoreThanOneImageException(Exception ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ResponseData<Void>> handleNoResourceFoundException(Exception ex) {
        return buildError(HttpStatus.NOT_FOUND, "The requested endpoint does not exist");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseData<Void>> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(FieldError::getDefaultMessage)
                .orElse("Invalid request !");
        return buildError(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ResponseData<Void>> handleMissingServletRequestPartException(MissingServletRequestPartException ex) {
        return buildError(HttpStatus.BAD_REQUEST, "Required part '" + ex.getRequestPartName() + "' is missing !");
    }
    

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ResponseData<Void>> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex) {
        return buildError(HttpStatus.BAD_REQUEST, "Malformed request body !");
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ResponseData<Void>> handleMissingRequestHeaderException(MissingRequestHeaderException ex) {
        return buildError(HttpStatus.BAD_REQUEST, "Required header '" + ex.getHeaderName() + "' is missing !");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ResponseData<Void>> handleAccessDeniedException(AccessDeniedException ex) {
        return buildError(HttpStatus.FORBIDDEN, "You do not have permission to perform this action !");
    }

    private ResponseEntity<ResponseData<Void>> buildError(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(ResponseData.error(message));
    }
}
