package com.hasta.ecommerce.order.repository;

import com.hasta.ecommerce.order.entity.OrderGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OrderGroupRepository extends JpaRepository<OrderGroup, Long> {
    Page<OrderGroup> findByUserId(Long userId, Pageable pageable);
}