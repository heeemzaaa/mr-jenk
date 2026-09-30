package com.ecommerce.mediaservice.dtos;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record DeleteMediaRequest(
        @NotNull(message = "Target type is required !") TargetType targetType,
        @NotNull(message = "Invalid target Id !") String targetId, //userId or productId
        @NotEmpty(message = "At least one image is required !") List<String> imagePaths) {

}
