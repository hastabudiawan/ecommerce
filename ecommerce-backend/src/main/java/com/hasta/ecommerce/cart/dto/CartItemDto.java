package com.hasta.ecommerce.cart.dto;

import java.math.BigDecimal;

public record CartItemDto(
        Long id,
        Long productId,
        String productName,
        String productSlug,
        String imageUrl,
        Long storeId,
        String storeName,
        BigDecimal priceSnapshot,
        Integer quantity,
        BigDecimal subtotal,
        int stock,
        boolean available   // false kalau produk sudah ditolak atau diturunkan admin
) {}