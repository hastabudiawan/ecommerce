package com.hasta.ecommerce.product.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record VariantsRequest(
        @NotNull(message = "variants wajib diisi")
        @Size(max = 50, message = "variants maksimal 50")
        @Valid List<VariantRequest> variants
) {}