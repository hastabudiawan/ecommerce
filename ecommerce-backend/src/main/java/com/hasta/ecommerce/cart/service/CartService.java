package com.hasta.ecommerce.cart.service;

import com.hasta.ecommerce.cart.dto.AddCartItemRequest;
import com.hasta.ecommerce.cart.dto.CartDto;
import com.hasta.ecommerce.cart.dto.UpdateCartItemRequest;

public interface CartService {
    CartDto getCart(Long userId);
    CartDto addItem(Long userId, AddCartItemRequest request);
    CartDto updateItemQuantity(Long userId, Long itemId, UpdateCartItemRequest request);
    CartDto removeItem(Long userId, Long itemId);
    void clearCart(Long userId);
}