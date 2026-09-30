package com.ecommerce.mediaservice.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;

import com.ecommerce.mediaservice.common.ResponseData;
import com.ecommerce.mediaservice.dtos.DeleteMediaRequest;
import com.ecommerce.mediaservice.dtos.MediaRequest;
import com.ecommerce.mediaservice.services.MediaService;
import jakarta.validation.Valid;
import jakarta.annotation.security.PermitAll;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/media/images")
public class MediaController {
    public final MediaService mediaService;

    @PreAuthorize("hasRole('SELLER')")
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ResponseData<List<String>>> saveMedia(@Valid @RequestPart("data") MediaRequest request,
            @RequestParam(required = false) MultipartFile[] images) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mediaService.saveMedia(request, images));
    }

    @PermitAll
    @GetMapping
    public ResponseEntity<ResponseData<Map<String, List<String>>>> getProductsMedias() {
        return ResponseEntity.ok(mediaService.getProductsMedias());
    }

    @PermitAll
    @GetMapping("/{productId}")
    public ResponseEntity<ResponseData<List<String>>> getMedias(@PathVariable String productId) {
        return ResponseEntity.ok(mediaService.getMedias(productId));
    }

    @PreAuthorize("hasRole('SELLER')")
    @DeleteMapping
    public ResponseEntity<ResponseData<String>> deleteMedia(@RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody DeleteMediaRequest request) {
        return ResponseEntity.ok(mediaService.deleteMedias(userId, request));
    }

    @PreAuthorize("hasRole('SELLER')")
    @PutMapping(consumes = "multipart/form-data")
    public ResponseEntity<ResponseData<List<String>>> updateMedia(@RequestHeader("X-User-Id") String userId,
            @Valid @RequestPart("data") MediaRequest request, @RequestParam(required = false) MultipartFile[] images) {
        return ResponseEntity.ok(mediaService.updateMedias(userId, request, images));
    }
}
