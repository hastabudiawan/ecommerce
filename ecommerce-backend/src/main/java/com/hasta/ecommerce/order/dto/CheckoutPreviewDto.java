package com.hasta.ecommerce.order.dto;

import java.math.BigDecimal;
import java.util.List;

public record CheckoutPreviewDto(
        List<StorePreview> stores,
        BigDecimal subtotal,
        BigDecimal shippingCost,
        BigDecimal total
) {
    public record StorePreview(
            Long storeId,          // null = produk platform
            String storeName,
            BigDecimal subtotal,
            BigDecimal shippingCost
    ) {}
}