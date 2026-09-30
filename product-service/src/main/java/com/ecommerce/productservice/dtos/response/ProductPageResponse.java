package com.ecommerce.productservice.dtos.response;

import java.util.List;

public record ProductPageResponse(
    List<ProductResponse> items,
    int currentPage,
    int pageSize,
    long totalElements,
    int totalPages,
    boolean hasNext,
    boolean hasPrevious) {}