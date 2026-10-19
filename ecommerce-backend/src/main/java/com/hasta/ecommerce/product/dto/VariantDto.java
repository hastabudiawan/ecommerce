package com.hasta.ecommerce.product.dto;

public record VariantDto(
        Long id,
        String colorName,
        String colorHex,
        String size,
        int stock,
        String label
) {}