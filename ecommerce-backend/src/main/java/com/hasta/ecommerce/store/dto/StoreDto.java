package com.hasta.ecommerce.store.dto;

import java.math.BigDecimal;

public record StoreDto(
        Long id,
        String storeName,
        String slug,
        String description,
        String city,
        BigDecimal shippingFee
) {}