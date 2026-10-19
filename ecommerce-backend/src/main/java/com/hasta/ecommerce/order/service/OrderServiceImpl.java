package com.hasta.ecommerce.order.service;

import com.hasta.ecommerce.common.exception.BadRequestException;
import com.hasta.ecommerce.common.exception.ResourceNotFoundException;
import com.hasta.ecommerce.order.dto.OrderDto;
import com.hasta.ecommerce.order.dto.OrderMapper;
import com.hasta.ecommerce.order.dto.UpdateOrderStatusRequest;
import com.hasta.ecommerce.order.entity.Order;
import com.hasta.ecommerce.order.entity.OrderItem; // Tambahan Import
import com.hasta.ecommerce.order.entity.OrderStatus;
import com.hasta.ecommerce.order.repository.OrderRepository;
import com.hasta.ecommerce.product.repository.ProductRepository;
import com.hasta.ecommerce.product.repository.ProductVariantRepository; // Tambahan Import
import com.hasta.ecommerce.settlement.service.SettlementService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository; // Tambahan Field
    private final SettlementService settlementService;

    // Constructor diperbarui
    public OrderServiceImpl(OrderRepository orderRepository, ProductRepository productRepository,
                             ProductVariantRepository productVariantRepository,
                             SettlementService settlementService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
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
        return OrderMapper.toDto(findOwnedOrder(userId, orderId));
    }

    @Override
    public OrderDto updateStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = findOrder(orderId);
        return OrderMapper.toDto(transition(order, request.status(), OrderActor.ADMIN));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDto> getSellerOrders(Long sellerId, Pageable pageable) {
        return orderRepository.findByStoreSellerId(sellerId, pageable).map(OrderMapper::toDto);
    }

    @Override
    public OrderDto updateStatusAsSeller(Long sellerId, Long orderId, UpdateOrderStatusRequest request) {
        Order order = findOrder(orderId);

        if (order.getStore() == null || !order.getStore().getSeller().getId().equals(sellerId)) {
            throw new BadRequestException("Order ini bukan milik toko Anda");
        }

        return OrderMapper.toDto(transition(order, request.status(), OrderActor.SELLER));
    }

    @Override
    public OrderDto cancelByCustomer(Long userId, Long orderId) {
        Order order = findOwnedOrder(userId, orderId);
        return OrderMapper.toDto(transition(order, OrderStatus.CANCELLED, OrderActor.CUSTOMER));
    }

    @Override
    public OrderDto confirmByCustomer(Long userId, Long orderId) {
        Order order = findOwnedOrder(userId, orderId);
        return OrderMapper.toDto(transition(order, OrderStatus.COMPLETED, OrderActor.CUSTOMER));
    }

    @Override
    public int autoCompleteShipped(int days) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);
        List<Order> stale = orderRepository.findByStatusAndUpdatedAtBefore(OrderStatus.SHIPPED, cutoff);

        stale.forEach(order -> transition(order, OrderStatus.COMPLETED, OrderActor.SYSTEM));
        return stale.size();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDto> getForAdmin(OrderStatus status, Pageable pageable) {
        Page<Order> orders = status != null
                ? orderRepository.findByStatus(status, pageable)
                : orderRepository.findAll(pageable);
        return orders.map(OrderMapper::toDto);
    }

    // Satu-satunya tempat status pesanan berubah. Semua aturan (siapa boleh, urutan,
    // efek samping stok dan settlement) ada di sini, bukan tersebar di tiap endpoint.
    private Order transition(Order order, OrderStatus next, OrderActor actor) {
        OrderTransitions.validate(order.getStatus(), next, actor);

        if (next == OrderStatus.CANCELLED) {
            restoreStock(order);
        }

        order.setStatus(next);

        if (next == OrderStatus.COMPLETED) {
            settlementService.createForOrderIfEligible(order);
        }

        return order;
    }

    // Metode restoreStock diperbarui
    private void restoreStock(Order order) {
        order.getItems().stream()
                .sorted(Comparator
                        .comparing((OrderItem item) -> item.getProduct().getId())
                        .thenComparing(item -> item.getVariant() == null ? 0L : item.getVariant().getId()))
                .forEach(item -> {
                    int quantity = item.getQuantity();

                    if (item.getVariant() != null) {
                        // Varian masih ada: kembalikan ke varian dan ke total stok produk
                        productVariantRepository.increaseStock(item.getVariant().getId(), quantity);
                        productRepository.increaseStock(item.getProduct().getId(), quantity);
                    } else if (item.getVariantLabel() == null) {
                        // Produk tanpa varian
                        productRepository.increaseStock(item.getProduct().getId(), quantity);
                    }
                    // variantLabel ada tapi varian null: varian sudah dihapus seller,
                    // tidak ada stok yang bisa dikembalikan
                });
    }

    private Order findOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order dengan id " + orderId + " tidak ditemukan"));
    }

    private Order findOwnedOrder(Long userId, Long orderId) {
        Order order = findOrder(orderId);
        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Order ini bukan milik Anda");
        }
        return order;
    }
}