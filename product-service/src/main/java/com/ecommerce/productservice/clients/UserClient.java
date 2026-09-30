package com.ecommerce.productservice.clients;

import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.resilience.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.ecommerce.productservice.dtos.response.UserResponse;



@Service
public class UserClient {
  private final RestClient restClient;
  private final CircuitBreaker circuitBreaker;

  public UserClient(@LoadBalanced RestClient.Builder loadBalanced, CircuitBreakerFactory circuitBreakerFactory) {
    this.restClient = loadBalanced.baseUrl("http://user-service").build();
    this.circuitBreaker = circuitBreakerFactory.create("userService");
  }

  @Retryable(maxRetries = 3)
  public UserResponse getSeller(String id) {
    return circuitBreaker.run(
      ()-> this.restClient.get()
        .uri("/users/{id}", id)
        .retrieve()
        .body(UserResponse.class),
      throwable -> getSellerFallback(id));
  }

  private UserResponse getSellerFallback(String id) {
    return new UserResponse(id, "Can't resolve this user");
  }
}
