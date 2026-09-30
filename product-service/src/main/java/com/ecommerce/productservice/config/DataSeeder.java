package com.ecommerce.productservice.config;

import java.math.BigDecimal;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.ecommerce.productservice.models.Product;
import com.ecommerce.productservice.repositories.ProductRepository;

@Configuration
public class DataSeeder {

  @Bean
  CommandLineRunner seedProducts(ProductRepository repository) {
    return args -> {
      if (repository.count() == 0) {
        repository.save(Product.builder()
            .id("1")
            .name("product-1")
            .description("product 1 description")
            .price(BigDecimal.valueOf(10.00))
            .quantity(100)
            .userId("1")
            .build());
        repository.save(Product.builder()
            .id("2")
            .name("product-2")
            .description("product 2 description")
            .price(BigDecimal.valueOf(12.50))
            .quantity(150)
            .userId("1")
            .build());
        repository.save(Product.builder()
            .id("3")
            .name("product-3")
            .description("product 3 description")
            .price(BigDecimal.valueOf(12.50))
            .quantity(150)
            .userId("2")
            .build());
        repository.save(Product.builder()
            .id("4")
            .name("product-4")
            .description("product 4 description")
            .price(BigDecimal.valueOf(12.50))
            .quantity(150)
            .userId("2")
            .build());
      }
    };
  }
}