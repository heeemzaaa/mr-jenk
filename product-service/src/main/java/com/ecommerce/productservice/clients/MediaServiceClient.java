package com.ecommerce.productservice.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "media-service")
public interface MediaServiceClient {

  @GetMapping("/media/images/{productId}")
  MediaImagesResponse getMedias(@PathVariable("productId") String productId);

  @DeleteMapping("/media/images")
  void deleteMedia(
      @RequestHeader("X-User-Id") String userId,
      @RequestHeader("X-User-Role") String userRole,
      @RequestBody DeleteMediaRequest request);
}