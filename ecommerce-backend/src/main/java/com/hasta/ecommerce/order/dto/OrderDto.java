package com.hasta.ecommerce.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderDto(
        Long id,
        String orderNumber,
        Long storeId,
        String storeName,      // null = "Platform" (produk tanpa toko)
        String status,
        List<OrderItemDto> items,
        BigDecimal subtotal,
        BigDecimal shippingCost,
        BigDecimal total,
        String recipientName,
        String shippingAddress,
        LocalDateTime createdAt
) {}