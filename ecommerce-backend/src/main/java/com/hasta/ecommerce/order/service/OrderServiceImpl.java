package com.hasta.ecommerce.order.service;

import com.hasta.ecommerce.common.exception.BadRequestException;
import com.hasta.ecommerce.common.exception.ResourceNotFoundException;
import com.hasta.ecommerce.order.dto.OrderDto;
import com.hasta.ecommerce.order.dto.OrderMapper;
import com.hasta.ecommerce.order.dto.UpdateOrderStatusRequest;
import com.hasta.ecommerce.order.entity.Order;
import com.hasta.ecommerce.order.entity.OrderStatus;
import com.hasta.ecommerce.order.repository.OrderRepository;
import com.hasta.ecommerce.settlement.service.SettlementService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final SettlementService settlementService;

    public OrderServiceImpl(OrderRepository orderRepository, SettlementService settlementService) {
        this.orderRepository = orderRepository;
        this.settlementService = settlementService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDto> getMyOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable).map(OrderMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDto getMyOrderDetail(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order dengan id " + orderId + " tidak ditemukan"));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Order ini bukan milik Anda");
        }
        return OrderMapper.toDto(order);
    }

    @Override
    public OrderDto updateStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order dengan id " + orderId + " tidak ditemukan"));

        order.setStatus(request.status());

        if (request.status() == OrderStatus.COMPLETED) {
            settlementService.createForOrderIfEligible(order);
        }

        return OrderMapper.toDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDto> getSellerOrders(Long sellerId, Pageable pageable) {
        return orderRepository.findByStoreSellerId(sellerId, pageable).map(OrderMapper::toDto);
    }

    @Override
    public OrderDto updateStatusAsSeller(Long sellerId, Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order dengan id " + orderId + " tidak ditemukan"));

        if (order.getStore() == null || !order.getStore().getSeller().getId().equals(sellerId)) {
            throw new BadRequestException("Order ini bukan milik toko Anda");
        }

        order.setStatus(request.status());

        if (request.status() == OrderStatus.COMPLETED) {
            settlementService.createForOrderIfEligible(order);
        }

        return OrderMapper.toDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDto> getForAdmin(OrderStatus status, Pageable pageable) {
        Page<Order> orders = status != null
                ? orderRepository.findByStatus(status, pageable)
                : orderRepository.findAll(pageable);
        return orders.map(OrderMapper::toDto);
    }
}