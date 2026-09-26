package com.hasta.ecommerce.product.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProductDto(
        Long id,
        Long categoryId,
        String categoryName,
        Long storeId,
        String storeName,
        String name,
        String slug,
        String description,
        BigDecimal price,
        Integer stock,
        String status,
        String rejectionReason,
        List<ProductImageDto> images,
        LocalDateTime createdAt
) {}