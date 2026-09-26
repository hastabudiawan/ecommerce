package com.hasta.ecommerce.settlement.dto;

import java.math.BigDecimal;

public record SettlementSummaryDto(
        BigDecimal totalPending,
        BigDecimal totalReleased
) {}