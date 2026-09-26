package com.hasta.ecommerce.cart.dto;

import com.hasta.ecommerce.cart.entity.Cart;
import com.hasta.ecommerce.cart.entity.CartItem;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

public class CartMapper {

    private CartMapper() {}

    public static CartDto toDto(Cart cart) {
        List<CartItemDto> items = cart.getItems().stream()
                .map(CartMapper::toItemDto)
                .collect(Collectors.toList());

        BigDecimal totalPrice = items.stream()
                .map(CartItemDto::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = items.stream()
                .mapToInt(CartItemDto::quantity)
                .sum();

        return new CartDto(cart.getId(), items, totalPrice, totalItems);
    }

    private static CartItemDto toItemDto(CartItem item) {
        BigDecimal subtotal = item.getPriceSnapshot().multiply(BigDecimal.valueOf(item.getQuantity()));
        return new CartItemDto(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getSlug(),
                item.getPriceSnapshot(),
                item.getQuantity(),
                subtotal
        );
    }
}