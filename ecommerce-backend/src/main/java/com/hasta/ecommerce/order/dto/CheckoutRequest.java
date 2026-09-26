package com.hasta.ecommerce.order.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CheckoutRequest(
        @NotNull(message = "addressId wajib diisi")
        Long addressId,

        // Satu entry per toko yang produknya ada di cart. Kalau toko tertentu tidak
        // disertakan di list ini, shipping cost untuk toko itu dianggap 0.
        List<StoreShippingCost> shippingCosts
) {}