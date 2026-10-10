package com.hasta.ecommerce.order.service;

import com.hasta.ecommerce.order.dto.OrderDto;
import com.hasta.ecommerce.order.dto.UpdateOrderStatusRequest;
import com.hasta.ecommerce.order.entity.OrderStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    Page<OrderDto> getMyOrders(Long userId, Pageable pageable);

    OrderDto getMyOrderDetail(Long userId, Long orderId);

    OrderDto updateStatus(Long orderId, UpdateOrderStatusRequest request);

    Page<OrderDto> getSellerOrders(Long sellerId, Pageable pageable);

    OrderDto updateStatusAsSeller(Long sellerId, Long orderId, UpdateOrderStatusRequest request);

    Page<OrderDto> getForAdmin(OrderStatus status, Pageable pageable);
}