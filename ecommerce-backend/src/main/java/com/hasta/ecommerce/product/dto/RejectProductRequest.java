package com.hasta.ecommerce.product.dto;

import jakarta.validation.constraints.NotBlank;

public record RejectProductRequest(
        @NotBlank(message = "reason wajib diisi")
        String reason
) {}