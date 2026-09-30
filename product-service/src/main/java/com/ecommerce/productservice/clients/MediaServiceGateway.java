package com.ecommerce.productservice.clients;

import java.util.List;

import org.springframework.stereotype.Component;

import feign.FeignException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class MediaServiceGateway {
  private final MediaServiceClient mediaServiceClient;

  @CircuitBreaker(name = "mediaService", fallbackMethod = "getImagesFallback")
  public List<String> getImages(String productId) {
    try {
      MediaImagesResponse response = mediaServiceClient.getMedias(productId);
      return response.data() != null ? response.data() : List.of();
    } catch (FeignException.NotFound e) {
      return List.of();
    }
  }

  private List<String> getImagesFallback(String productId, Throwable t) {
    log.warn("Media Service unavailable, returning no images for product {}: {}", productId, t.getMessage());
    return List.of();
  }

  // Best-effort cascade delete: called right before the product itself is
  // removed, while it still exists so media-service can verify ownership.
  // Must not block product deletion if media-service is unreachable or the
  // cleanup fails — the product record going away takes priority.
  public void deleteProductMedia(String productId, String userId) {
    List<String> imagePaths = getImages(productId);

    if (imagePaths.isEmpty()) {
      return;
    }

    try {
      // Callable only from ProductController.deleteProduct, which already
      // requires hasRole('SELLER') to reach here.
      mediaServiceClient.deleteMedia(userId, "SELLER", new DeleteMediaRequest("PRODUCT", productId, imagePaths));
    } catch (Exception e) {
      log.warn("Failed to delete media for product {}: {}", productId, e.getMessage());
    }
  }
}