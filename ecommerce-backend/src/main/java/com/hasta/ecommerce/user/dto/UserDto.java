package com.hasta.ecommerce.user.dto;

import java.time.LocalDateTime;

public record UserDto(
        Long id,
        String name,
        String email,
        String phone,
        String role,
        boolean enabled,
        boolean hasStore,
        LocalDateTime createdAt
) {}