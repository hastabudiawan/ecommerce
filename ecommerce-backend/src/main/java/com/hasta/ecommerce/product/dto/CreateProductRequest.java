package com.hasta.ecommerce.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
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

        // Opsional. Kalau tidak dikirim dianggap 0 (tanpa diskon), jadi klien lama tetap berfungsi
        @Min(value = 0, message = "discountPercent tidak boleh negatif")
        @Max(value = 90, message = "discountPercent maksimal 90")
        Integer discountPercent,

        @NotNull(message = "stock wajib diisi")
        @Min(value = 0, message = "stock tidak boleh negatif")
        Integer stock
) {}