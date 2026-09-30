package com.ecommerce.productservice.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {
  
  @Bean
  @LoadBalanced
  RestClient.Builder loadBalenced() {
    return RestClient.builder();
  }

  @Bean
  @Primary
  RestClient.Builder restClient() {
    return RestClient.builder();
  }

}
