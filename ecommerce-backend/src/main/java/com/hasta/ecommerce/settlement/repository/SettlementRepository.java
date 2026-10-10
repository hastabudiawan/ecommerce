package com.hasta.ecommerce.settlement.repository;

import com.hasta.ecommerce.settlement.entity.Settlement;
import com.hasta.ecommerce.settlement.entity.SettlementStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface SettlementRepository extends JpaRepository<Settlement, Long> {

    Page<Settlement> findByStoreId(Long storeId, Pageable pageable);

    boolean existsByOrderId(Long orderId);

    @Query("SELECT COALESCE(SUM(s.amount), 0) FROM Settlement s WHERE s.store.id = :storeId AND s.status = :status")
    BigDecimal sumAmountByStoreIdAndStatus(@Param("storeId") Long storeId, @Param("status") SettlementStatus status);

    Page<Settlement> findByStatus(SettlementStatus status, Pageable pageable);
}