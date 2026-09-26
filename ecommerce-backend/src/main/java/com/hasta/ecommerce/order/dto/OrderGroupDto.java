package com.hasta.ecommerce.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderGroupDto(
        Long id,
        String groupNumber,
        BigDecimal subtotal,
        BigDecimal shippingCost,
        BigDecimal total,
        String recipientName,
        String shippingAddress,
        List<OrderDto> orders,
        LocalDateTime createdAt
) {}