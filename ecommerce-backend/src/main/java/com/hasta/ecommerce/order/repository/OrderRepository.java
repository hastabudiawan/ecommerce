package com.hasta.ecommerce.order.repository;

import com.hasta.ecommerce.order.entity.Order;
import com.hasta.ecommerce.order.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);

    Page<Order> findByUserId(Long userId, Pageable pageable);

    Page<Order> findByUserIdAndStatus(Long userId, OrderStatus status, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.store.seller.id = :sellerId")
    Page<Order> findByStoreSellerId(@Param("sellerId") Long sellerId, Pageable pageable);
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
}