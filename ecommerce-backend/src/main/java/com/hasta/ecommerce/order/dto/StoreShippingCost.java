package com.hasta.ecommerce.order.dto;

import java.math.BigDecimal;

public record StoreShippingCost(
        Long storeId,   // null = shipping cost untuk produk platform (tanpa toko)
        BigDecimal shippingCost
) {}