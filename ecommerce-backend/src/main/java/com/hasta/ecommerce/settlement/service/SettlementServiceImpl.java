package com.hasta.ecommerce.settlement.service;

import com.hasta.ecommerce.common.exception.ResourceNotFoundException;
import com.hasta.ecommerce.order.entity.Order;
import com.hasta.ecommerce.settlement.dto.SettlementDto;
import com.hasta.ecommerce.settlement.dto.SettlementMapper;
import com.hasta.ecommerce.settlement.dto.SettlementSummaryDto;
import com.hasta.ecommerce.settlement.entity.Settlement;
import com.hasta.ecommerce.settlement.entity.SettlementStatus;
import com.hasta.ecommerce.settlement.repository.SettlementRepository;
import com.hasta.ecommerce.store.entity.Store;
import com.hasta.ecommerce.store.repository.StoreRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@Transactional
public class SettlementServiceImpl implements SettlementService {

    private final SettlementRepository settlementRepository;
    private final StoreRepository storeRepository;

    public SettlementServiceImpl(SettlementRepository settlementRepository, StoreRepository storeRepository) {
        this.settlementRepository = settlementRepository;
        this.storeRepository = storeRepository;
    }

    @Override
    public void createForOrderIfEligible(Order order) {
        // Order tanpa toko (produk platform) tidak butuh settlement - uangnya memang
        // milik platform
        if (order.getStore() == null) {
            return;
        }
        // Cegah duplikat kalau status COMPLETED di-set lebih dari sekali untuk order
        // yang sama
        if (settlementRepository.existsByOrderId(order.getId())) {
            return;
        }

        Settlement settlement = new Settlement(order.getStore(), order, order.getTotal());
        settlementRepository.save(settlement);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SettlementDto> getMySettlements(Long sellerId, Pageable pageable) {
        Store store = storeRepository.findBySellerId(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Anda belum punya toko"));
        return settlementRepository.findByStoreId(store.getId(), pageable).map(SettlementMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public SettlementSummaryDto getMySummary(Long sellerId) {
        Store store = storeRepository.findBySellerId(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Anda belum punya toko"));

        BigDecimal totalPending = settlementRepository.sumAmountByStoreIdAndStatus(store.getId(),
                SettlementStatus.PENDING);
        BigDecimal totalReleased = settlementRepository.sumAmountByStoreIdAndStatus(store.getId(),
                SettlementStatus.RELEASED);

        return new SettlementSummaryDto(totalPending, totalReleased);
    }

    @Override
    public SettlementDto release(Long settlementId) {
        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Settlement dengan id " + settlementId + " tidak ditemukan"));

        settlement.setStatus(SettlementStatus.RELEASED);
        settlement.setReleasedAt(LocalDateTime.now());
        return SettlementMapper.toDto(settlement);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SettlementDto> getAllForAdmin(SettlementStatus status, Pageable pageable) {
        Page<Settlement> settlements = status != null
                ? settlementRepository.findByStatus(status, pageable)
                : settlementRepository.findAll(pageable);
        return settlements.map(SettlementMapper::toDto);
    }
}