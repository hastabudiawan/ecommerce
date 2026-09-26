package com.hasta.ecommerce.settlement.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SettlementDto(
        Long id,
        String orderNumber,
        BigDecimal amount,
        String status,
        LocalDateTime createdAt,
        LocalDateTime releasedAt
) {}