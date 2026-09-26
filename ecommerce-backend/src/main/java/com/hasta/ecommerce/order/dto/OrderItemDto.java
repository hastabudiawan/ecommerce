package com.hasta.ecommerce.order.dto;

import java.math.BigDecimal;

public record OrderItemDto(
        Long productId,
        String productName,
        BigDecimal priceSnapshot,
        Integer quantity,
        BigDecimal subtotal
) {}