package com.hasta.ecommerce.user.controller;

import com.hasta.ecommerce.common.response.ApiResponse;
import com.hasta.ecommerce.security.SecurityUtils;
import com.hasta.ecommerce.user.dto.AddressDto;
import com.hasta.ecommerce.user.dto.CreateAddressRequest;
import com.hasta.ecommerce.user.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressDto>>> getMyAddresses() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(addressService.getMyAddresses(userId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressDto>> create(@Valid @RequestBody CreateAddressRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        AddressDto created = addressService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Address berhasil ditambahkan", created));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long addressId) {
        Long userId = SecurityUtils.getCurrentUserId();
        addressService.delete(userId, addressId);
        return ResponseEntity.ok(ApiResponse.success("Address berhasil dihapus", null));
    }
}