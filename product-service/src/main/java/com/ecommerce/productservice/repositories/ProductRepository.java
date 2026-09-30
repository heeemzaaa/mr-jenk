package com.ecommerce.productservice.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.ecommerce.productservice.models.Product;

public interface ProductRepository extends MongoRepository<Product, String> {

  Page<Product> findByUserId(String userId, Pageable pageable);

  public String deleteByUserId(String id);
}