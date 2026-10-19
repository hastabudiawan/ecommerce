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
        Long variantId,        // null untuk produk tanpa varian
        String variantLabel,   // misalnya "Hitam / L"
        BigDecimal priceSnapshot,
        Integer quantity,
        BigDecimal subtotal,
        int stock,             // stok varian kalau ada varian, kalau tidak stok produk
        boolean available      // false kalau produk sudah ditolak, diturunkan, atau diarsipkan
) {}