package com.hasta.ecommerce.store.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateStoreRequest(
        @NotBlank(message = "storeName wajib diisi")
        String storeName,

        String description,
        String city
) {}