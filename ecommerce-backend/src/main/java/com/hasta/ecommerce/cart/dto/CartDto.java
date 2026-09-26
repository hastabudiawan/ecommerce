package com.hasta.ecommerce.cart.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartDto(
        Long id,
        List<CartItemDto> items,
        BigDecimal totalPrice,
        int totalItems
) {}