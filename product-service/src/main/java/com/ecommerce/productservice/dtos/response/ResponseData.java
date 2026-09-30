package com.ecommerce.productservice.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResponseData<T> {
  private boolean success;
  private String message;
  private T data;

  public static <T> ResponseData<T> success(String message, T data) {
    return new ResponseData<>(true, message, data);
  }

  public static <T> ResponseData<T> error(String message) {
    return new ResponseData<>(false, message, null);
  }
}