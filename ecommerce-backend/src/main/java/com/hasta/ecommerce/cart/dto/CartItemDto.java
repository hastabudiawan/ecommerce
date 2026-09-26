package com.hasta.ecommerce.cart.dto;

import java.math.BigDecimal;

public record CartItemDto(
        Long id,
        Long productId,
        String productName,
        String productSlug,
        BigDecimal priceSnapshot,
        Integer quantity,
        BigDecimal subtotal
) {}