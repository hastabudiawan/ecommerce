package com.hasta.ecommerce.store.dto;

public record StoreDto(
        Long id,
        String storeName,
        String slug,
        String description,
        String city
) {}