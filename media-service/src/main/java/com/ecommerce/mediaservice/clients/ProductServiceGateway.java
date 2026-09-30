package com.ecommerce.mediaservice.clients;

import org.springframework.stereotype.Component;

import com.ecommerce.mediaservice.common.ResponseData;
import com.ecommerce.mediaservice.dtos.Product;
import com.ecommerce.mediaservice.exceptions.Product.ProductServiceUnavailableException;

import feign.FeignException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductServiceGateway {
    private final ProductServiceClient productServiceClient;

    @CircuitBreaker(name = "producService", fallbackMethod = "getProductFallback")
    public Product getProduct(String productId) {
        try {
            ResponseData<Product> response = productServiceClient.getProduct(productId);
            return response.getData() != null ? response.getData() : null;
        } catch (FeignException.NotFound ex) {
            return null;
        }
    }

    private Product getProductFallback(String productId, Throwable t) {
        log.warn("Product service unavailable, returning no product {}: {}", productId, t.getMessage());
        throw new ProductServiceUnavailableException("Unable to reach the product service, please try again later !", t);
    }
}
