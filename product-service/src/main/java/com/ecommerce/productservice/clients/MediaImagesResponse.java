package com.ecommerce.productservice.clients;

import java.util.List;

public record MediaImagesResponse(
  boolean success, 
  String message, 
  List<String> data) {
}