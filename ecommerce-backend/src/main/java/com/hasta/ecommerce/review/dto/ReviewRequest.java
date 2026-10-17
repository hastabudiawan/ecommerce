package com.hasta.ecommerce.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReviewRequest(
        @NotNull(message = "rating wajib diisi")
        @Min(value = 1, message = "rating minimal 1")
        @Max(value = 5, message = "rating maksimal 5") Integer rating,

        @Size(max = 1000, message = "comment maksimal 1000 karakter") String comment
) {}