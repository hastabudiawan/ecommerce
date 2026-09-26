package com.hasta.ecommerce.settlement.dto;

import com.hasta.ecommerce.settlement.entity.Settlement;

public class SettlementMapper {
    private SettlementMapper() {}

    public static SettlementDto toDto(Settlement settlement) {
        return new SettlementDto(
                settlement.getId(),
                settlement.getOrder().getOrderNumber(),
                settlement.getAmount(),
                settlement.getStatus().name(),
                settlement.getCreatedAt(),
                settlement.getReleasedAt()
        );
    }
}