package com.ecommerce.productservice.controllers;

import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.productservice.dtos.request.ProductRequest;
import com.ecommerce.productservice.dtos.response.*;
import com.ecommerce.productservice.services.ProductService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/products")
@AllArgsConstructor
public class ProductController {
  private final ProductService productService;

  @GetMapping
  public ResponseData<ProductPageResponse> getAllProducts(
      @RequestParam(required = false) String owner,
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer limit) {
    ProductPageResponse result = productService.getProducts(owner, page, limit);
    return ResponseData.success("Products retrieved successfully", result);
  }

  @GetMapping("/{id}")
  public ResponseData<ProductResponse> getProduct(@PathVariable String id) {
    return ResponseData.success("Product retrieved successfully", productService.getProductById(id));
  }

  @PreAuthorize("hasRole('SELLER')")
  @PostMapping
  public ResponseEntity<ResponseData<ProductResponse>> createProduct(
      @Valid @RequestBody ProductRequest request,
      @RequestHeader("X-User-Id") String userId) {
    ProductResponse product = productService.create(request, userId);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ResponseData.success("Product created successfully", product));
  }

  @PreAuthorize("hasRole('SELLER')")
  @PutMapping("/{id}")
  public ResponseEntity<ResponseData<ProductResponse>> updateProduct(
      @PathVariable String id,
      @Valid @RequestBody ProductRequest request,
      @RequestHeader("X-User-Id") String userId) {
    ProductResponse product = productService.updateProduct(request, id, userId);
    return ResponseEntity.ok(ResponseData.success("Product updated successfully", product));
  }

  @PreAuthorize("hasRole('SELLER')")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteProduct(
      @PathVariable String id,
      @RequestHeader("X-User-Id") String userId) {
    productService.deleteProduct(id, userId);
    return ResponseEntity.noContent().build();
  }
}