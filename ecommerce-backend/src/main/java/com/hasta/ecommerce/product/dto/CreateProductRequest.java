package com.hasta.ecommerce.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateProductRequest(
        @NotNull(message = "categoryId wajib diisi")
        Long categoryId,

        @NotBlank(message = "name wajib diisi")
        String name,

        String description,

        @NotNull(message = "price wajib diisi")
        @DecimalMin(value = "0.0", inclusive = true, message = "price tidak boleh negatif")
        BigDecimal price,

        @NotNull(message = "stock wajib diisi")
        @Min(value = 0, message = "stock tidak boleh negatif")
        Integer stock
) {}