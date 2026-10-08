package com.hasta.ecommerce.cart.dto;

import com.hasta.ecommerce.cart.entity.Cart;
import com.hasta.ecommerce.cart.entity.CartItem;
import com.hasta.ecommerce.product.entity.Product;
import com.hasta.ecommerce.product.entity.ProductImage;

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
        Product product = item.getProduct();
        BigDecimal subtotal = item.getPriceSnapshot().multiply(BigDecimal.valueOf(item.getQuantity()));

        String imageUrl = product.getImages().stream()
                .filter(ProductImage::isPrimary)
                .findFirst()
                .or(() -> product.getImages().stream().findFirst())
                .map(ProductImage::getImageUrl)
                .orElse(null);

        Long storeId = product.getStore() != null ? product.getStore().getId() : null;
        String storeName = product.getStore() != null ? product.getStore().getStoreName() : null;

        return new CartItemDto(
                item.getId(),
                product.getId(),
                product.getName(),
                product.getSlug(),
                imageUrl,
                storeId,
                storeName,
                item.getPriceSnapshot(),
                item.getQuantity(),
                subtotal
        );
    }
}