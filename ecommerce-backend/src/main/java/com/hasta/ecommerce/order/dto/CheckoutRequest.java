package com.hasta.ecommerce.order.dto;

import jakarta.validation.constraints.NotNull;

public record CheckoutRequest(
        @NotNull(message = "addressId wajib diisi") Long addressId
) {}