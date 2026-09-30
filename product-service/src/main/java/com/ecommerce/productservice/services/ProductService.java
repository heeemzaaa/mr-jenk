package com.ecommerce.productservice.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.ecommerce.productservice.clients.MediaServiceGateway;
import com.ecommerce.productservice.dtos.request.ProductRequest;
import com.ecommerce.productservice.dtos.response.*;
import com.ecommerce.productservice.exceptions.custom.ForbiddenException;
import com.ecommerce.productservice.exceptions.custom.ResourceNotFoundException;
import com.ecommerce.productservice.models.Product;
import com.ecommerce.productservice.repositories.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {
  private final ProductRepository productRepository;
  private final MediaServiceGateway mediaServiceGateway;

  private static final int DEFAULT_LIMIT = 20;
  private static final int MAX_LIMIT = 100;

  public ProductPageResponse getProducts(String owner, Integer page, Integer limit) {
    Pageable pageable = PageRequest.of(
        resolvePage(page),
        resolveLimit(limit),
        Sort.by(Sort.Direction.DESC, "createdAt"));

    Page<Product> result = (owner != null && !owner.isBlank())
        ? productRepository.findByUserId(owner, pageable)
        : productRepository.findAll(pageable);

    List<ProductResponse> items = result.getContent().stream()
        .map(p -> ProductResponse.from(p, mediaServiceGateway.getImages(p.getId())))
        .toList();

    return new ProductPageResponse(
        items,
        result.getNumber(),
        result.getSize(),
        result.getTotalElements(),
        result.getTotalPages(),
        result.hasNext(),
        result.hasPrevious());
  }

  public ProductResponse getProductById(String id) {
    Product product = findProductById(id);
    return ProductResponse.from(product, mediaServiceGateway.getImages(id));
  }

  public ProductResponse create(ProductRequest request, String sellerId) {
    Product product = Product.builder()
        .name(request.name())
        .description(request.description())
        .price(request.price())
        .quantity(request.quantity())
        .userId(sellerId)
        .build();

    Product saved = productRepository.save(product);
    return ProductResponse.from(saved, List.of());
  }

  public ProductResponse updateProduct(ProductRequest req, String id, String userId) {
    Product existingProduct = findProductById(id);

    if (!existingProduct.getUserId().equals(userId)) {
      throw new ForbiddenException("You do not own this product");
    }

    existingProduct.setName(req.name());
    existingProduct.setDescription(req.description());
    existingProduct.setPrice(req.price());
    existingProduct.setQuantity(req.quantity());

    Product saved = productRepository.save(existingProduct);
    return ProductResponse.from(saved, mediaServiceGateway.getImages(id));
  }

  public void deleteProduct(String id, String userId) {
    Product existingProduct = findProductById(id);

    if (!existingProduct.getUserId().equals(userId)) {
      throw new ForbiddenException("You do not own this product");
    }

    productRepository.delete(existingProduct);
  }

  @KafkaListener(topics = "user-events", groupId = "product-service")
  public void deleteProductByUserId(String id) {
    productRepository.deleteByUserId(id);
  }

  private Product findProductById(String id) {
    return productRepository.findById(id).orElseThrow(
        () -> new ResourceNotFoundException("Product", id));
  }

  private int resolvePage(Integer requested) {
    return (requested == null || requested < 0) ? 0 : requested;
  }

  private int resolveLimit(Integer requested) {
    if (requested == null) {
      return DEFAULT_LIMIT;
    }
    return Math.max(1, Math.min(requested, MAX_LIMIT));
  }
}