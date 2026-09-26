package com.hasta.ecommerce.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateCartItemRequest(
        @NotNull(message = "quantity wajib diisi")
        @Min(value = 1, message = "quantity minimal 1, gunakan DELETE untuk menghapus item")
        Integer quantity
) {}