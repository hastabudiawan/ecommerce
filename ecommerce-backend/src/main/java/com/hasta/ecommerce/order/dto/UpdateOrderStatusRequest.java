package com.hasta.ecommerce.order.dto;

import com.hasta.ecommerce.order.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull(message = "status wajib diisi")
        OrderStatus status
) {}