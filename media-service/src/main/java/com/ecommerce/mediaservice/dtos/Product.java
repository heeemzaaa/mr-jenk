package com.ecommerce.mediaservice.dtos;

import java.util.List;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record Product(
        String id,
        String name,
        String description,
        BigDecimal price,
        Integer quantity,
        String userId,
        List<String> imageUrls) {

}
