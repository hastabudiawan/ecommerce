package com.hasta.ecommerce.review.dto;

import java.time.LocalDateTime;

public record ReviewDto(
        Long id,
        int rating,
        String comment,
        String authorName,
        LocalDateTime createdAt
) {}