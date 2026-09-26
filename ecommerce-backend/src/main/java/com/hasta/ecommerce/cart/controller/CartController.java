package com.hasta.ecommerce.cart.controller;

import com.hasta.ecommerce.cart.dto.AddCartItemRequest;
import com.hasta.ecommerce.cart.dto.CartDto;
import com.hasta.ecommerce.cart.dto.UpdateCartItemRequest;
import com.hasta.ecommerce.cart.service.CartService;
import com.hasta.ecommerce.common.response.ApiResponse;
import com.hasta.ecommerce.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartDto>> getCart() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(userId)));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartDto>> addItem(@Valid @RequestBody AddCartItemRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        CartDto cart = cartService.addItem(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Item berhasil ditambahkan ke cart", cart));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDto>> updateItem(
            @PathVariable Long itemId, @Valid @RequestBody UpdateCartItemRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        CartDto cart = cartService.updateItemQuantity(userId, itemId, request);
        return ResponseEntity.ok(ApiResponse.success("Quantity berhasil diupdate", cart));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDto>> removeItem(@PathVariable Long itemId) {
        Long userId = SecurityUtils.getCurrentUserId();
        CartDto cart = cartService.removeItem(userId, itemId);
        return ResponseEntity.ok(ApiResponse.success("Item berhasil dihapus dari cart", cart));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart() {
        Long userId = SecurityUtils.getCurrentUserId();
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart berhasil dikosongkan", null));
    }
}