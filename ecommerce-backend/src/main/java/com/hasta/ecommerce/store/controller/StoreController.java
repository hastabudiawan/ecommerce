package com.hasta.ecommerce.store.controller;

import com.hasta.ecommerce.common.response.ApiResponse;
import com.hasta.ecommerce.security.SecurityUtils;
import com.hasta.ecommerce.store.dto.CreateStoreRequest;
import com.hasta.ecommerce.store.dto.StoreDto;
import com.hasta.ecommerce.store.service.StoreService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class StoreController {

    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    @PostMapping("/seller/store")
    public ResponseEntity<ApiResponse<StoreDto>> createStore(@Valid @RequestBody CreateStoreRequest request) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        StoreDto created = storeService.createStore(sellerId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Toko berhasil dibuat", created));
    }

    @GetMapping("/seller/store")
    public ResponseEntity<ApiResponse<StoreDto>> getMyStore() {
        Long sellerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(storeService.getMyStore(sellerId)));
    }

    @GetMapping("/stores/{slug}")
    public ResponseEntity<ApiResponse<StoreDto>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(storeService.getBySlug(slug)));
    }
}