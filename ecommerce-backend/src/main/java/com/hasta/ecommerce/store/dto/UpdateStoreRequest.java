package com.hasta.ecommerce.store.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateStoreRequest(
        @NotBlank(message = "storeName wajib diisi")
        @Size(max = 150, message = "storeName maksimal 150 karakter") String storeName,

        @Size(max = 100, message = "city maksimal 100 karakter") String city,

        String description,

        @NotNull(message = "shippingFee wajib diisi")
        @DecimalMin(value = "0", message = "shippingFee tidak boleh negatif")
        @DecimalMax(value = "1000000", message = "shippingFee maksimal 1.000.000") BigDecimal shippingFee
) {}