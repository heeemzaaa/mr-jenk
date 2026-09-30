package com.ecommerce.mediaservice.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.ecommerce.mediaservice.common.ResponseData;
import com.ecommerce.mediaservice.dtos.Product;

@FeignClient(name = "product-service")
public interface ProductServiceClient {
    
    @GetMapping("/products/{id}")
    public ResponseData<Product> getProduct(@PathVariable("id") String id);
}
