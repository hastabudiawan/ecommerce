package com.hasta.ecommerce.order.dto;

import com.hasta.ecommerce.order.entity.Order;
import com.hasta.ecommerce.order.entity.OrderGroup;
import com.hasta.ecommerce.order.entity.OrderItem;

import java.util.List;
import java.util.stream.Collectors;

public class OrderMapper {

    private OrderMapper() {}

    public static OrderDto toDto(Order order) {
        List<OrderItemDto> items = order.getItems().stream()
                .map(OrderMapper::toItemDto)
                .collect(Collectors.toList());

        String shippingAddress = String.format("%s, %s, %s %s",
                order.getAddress().getAddressLine(),
                order.getAddress().getCity(),
                order.getAddress().getProvince(),
                order.getAddress().getPostalCode());

        Long storeId = order.getStore() != null ? order.getStore().getId() : null;
        String storeName = order.getStore() != null ? order.getStore().getStoreName() : "Platform";

        return new OrderDto(
                order.getId(),
                order.getOrderNumber(),
                storeId,
                storeName,
                order.getStatus().name(),
                items,
                order.getSubtotal(),
                order.getShippingCost(),
                order.getTotal(),
                order.getAddress().getRecipientName(),
                shippingAddress,
                order.getCreatedAt()
        );
    }

    private static OrderItemDto toItemDto(OrderItem item) {
        return new OrderItemDto(
                item.getProduct().getId(),
                item.getProductNameSnapshot(),
                item.getPriceSnapshot(),
                item.getQuantity(),
                item.getSubtotal()
        );
    }

    public static OrderGroupDto toGroupDto(OrderGroup group, List<Order> orders) {
        List<OrderDto> orderDtos = orders.stream().map(OrderMapper::toDto).collect(Collectors.toList());

        String shippingAddress = String.format("%s, %s, %s %s",
                group.getAddress().getAddressLine(),
                group.getAddress().getCity(),
                group.getAddress().getProvince(),
                group.getAddress().getPostalCode());

        return new OrderGroupDto(
                group.getId(),
                group.getGroupNumber(),
                group.getSubtotal(),
                group.getShippingCost(),
                group.getTotal(),
                group.getAddress().getRecipientName(),
                shippingAddress,
                orderDtos,
                group.getCreatedAt()
        );
    }
}