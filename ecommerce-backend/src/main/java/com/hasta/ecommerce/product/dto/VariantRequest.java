package com.hasta.ecommerce.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record VariantRequest(
        Long id,   // diisi untuk varian yang sudah ada; kosong untuk varian baru

        @Size(max = 50, message = "colorName maksimal 50 karakter") String colorName,

        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "colorHex harus berformat #RRGGBB") String colorHex,

        @Size(max = 20, message = "size maksimal 20 karakter") String size,

        @NotNull(message = "stock wajib diisi")
        @Min(value = 0, message = "stock tidak boleh negatif") Integer stock
) {}