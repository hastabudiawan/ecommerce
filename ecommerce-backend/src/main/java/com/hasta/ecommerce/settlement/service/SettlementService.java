package com.hasta.ecommerce.settlement.service;

import com.hasta.ecommerce.order.entity.Order;
import com.hasta.ecommerce.settlement.dto.SettlementDto;
import com.hasta.ecommerce.settlement.dto.SettlementSummaryDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SettlementService {
    void createForOrderIfEligible(Order order);
    Page<SettlementDto> getMySettlements(Long sellerId, Pageable pageable);
    SettlementSummaryDto getMySummary(Long sellerId);
    SettlementDto release(Long settlementId);
}