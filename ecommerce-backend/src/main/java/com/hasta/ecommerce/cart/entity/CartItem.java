package com.hasta.ecommerce.cart.entity;

import com.hasta.ecommerce.product.entity.Product;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "cart_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"cart_id", "product_id"})
})
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "price_snapshot", nullable = false, precision = 12, scale = 2)
    private BigDecimal priceSnapshot;

    protected CartItem() {}

    public CartItem(Cart cart, Product product, Integer quantity, BigDecimal priceSnapshot) {
        this.cart = cart;
        this.product = product;
        this.quantity = quantity;
        this.priceSnapshot = priceSnapshot;
    }

    public Long getId() { return id; }
    public Cart getCart() { return cart; }
    public Product getProduct() { return product; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getPriceSnapshot() { return priceSnapshot; }
}