package com.hasta.ecommerce.order.controller;

import com.hasta.ecommerce.common.response.ApiResponse;
import com.hasta.ecommerce.common.response.PageResponse;
import com.hasta.ecommerce.order.dto.CheckoutRequest;
import com.hasta.ecommerce.order.dto.OrderDto;
import com.hasta.ecommerce.order.dto.OrderGroupDto;
import com.hasta.ecommerce.order.dto.UpdateOrderStatusRequest;
import com.hasta.ecommerce.order.service.CheckoutService;
import com.hasta.ecommerce.order.service.OrderService;
import com.hasta.ecommerce.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final CheckoutService checkoutService;
    private final OrderService orderService;

    public OrderController(CheckoutService checkoutService, OrderService orderService) {
        this.checkoutService = checkoutService;
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderGroupDto>> checkout(@Valid @RequestBody CheckoutRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        OrderGroupDto result = checkoutService.checkout(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Checkout berhasil", result));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderDto>>> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        // Pageable pageable = PageRequest.of(page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<OrderDto> orders = orderService.getMyOrders(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(new PageResponse<>(orders)));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderDto>> getDetail(@PathVariable Long orderId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(orderService.getMyOrderDetail(userId, orderId)));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderDto>> updateStatus(
            @PathVariable Long orderId, @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderDto updated = orderService.updateStatus(orderId, request);
        return ResponseEntity.ok(ApiResponse.success("Status order berhasil diupdate", updated));
    }

    @GetMapping("/seller")
    public ResponseEntity<ApiResponse<PageResponse<OrderDto>>> getSellerOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<OrderDto> result = orderService.getSellerOrders(sellerId, pageable);
        return ResponseEntity.ok(ApiResponse.success(new PageResponse<>(result)));
    }

    @PutMapping("/seller/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderDto>> updateStatusAsSeller(
            @PathVariable Long orderId, @Valid @RequestBody UpdateOrderStatusRequest request) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        OrderDto updated = orderService.updateStatusAsSeller(sellerId, orderId, request);
        return ResponseEntity.ok(ApiResponse.success("Status order berhasil diupdate", updated));
    }
}