package com.hasta.ecommerce.user.dto;

import java.time.LocalDateTime;

public record AccountDto(
        Long id,
        String name,
        String email,
        String phone,
        String role,
        boolean hasStore,
        boolean emailVerified,
        LocalDateTime createdAt
) {}