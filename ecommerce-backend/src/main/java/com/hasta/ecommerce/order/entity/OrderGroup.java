package com.hasta.ecommerce.order.entity;

import com.hasta.ecommerce.user.entity.Address;
import com.hasta.ecommerce.user.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "order_groups")
public class OrderGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id", nullable = false)
    private Address address;

    @Column(name = "group_number", nullable = false, unique = true, length = 30)
    private String groupNumber;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "shipping_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal shippingCost;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "orderGroup")
    private List<Order> orders = new ArrayList<>();

    protected OrderGroup() {}

    public OrderGroup(User user, Address address, String groupNumber,
                       BigDecimal subtotal, BigDecimal shippingCost, BigDecimal total) {
        this.user = user;
        this.address = address;
        this.groupNumber = groupNumber;
        this.subtotal = subtotal;
        this.shippingCost = shippingCost;
        this.total = total;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public Address getAddress() { return address; }
    public String getGroupNumber() { return groupNumber; }
    public BigDecimal getSubtotal() { return subtotal; }
    public BigDecimal getShippingCost() { return shippingCost; }
    public BigDecimal getTotal() { return total; }
    public List<Order> getOrders() { return orders; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}