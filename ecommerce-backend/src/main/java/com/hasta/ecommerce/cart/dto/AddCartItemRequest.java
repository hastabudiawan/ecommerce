package com.hasta.ecommerce.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AddCartItemRequest(
        @NotNull(message = "productId wajib diisi")
        Long productId,

        @NotNull(message = "quantity wajib diisi")
        @Min(value = 1, message = "quantity minimal 1")
        Integer quantity
) {}