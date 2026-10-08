package com.hasta.ecommerce.cart.dto;

import java.math.BigDecimal;

public record CartItemDto(
        Long id,
        Long productId,
        String productName,
        String productSlug,
        String imageUrl,      // null kalau produk belum punya gambar
        Long storeId,         // null = produk platform
        String storeName,     // null = produk platform
        BigDecimal priceSnapshot,
        Integer quantity,
        BigDecimal subtotal
) {}