package com.hasta.ecommerce.order.entity;

import com.hasta.ecommerce.product.entity.Product;
import com.hasta.ecommerce.product.entity.ProductVariant;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;   // bisa menjadi null kalau variannya kemudian dihapus seller

    @Column(name = "variant_label", length = 100)
    private String variantLabel;      // salinan teks, tetap ada walau varian dihapus

    @Column(name = "product_name_snapshot", nullable = false, length = 200)
    private String productNameSnapshot;

    @Column(name = "price_snapshot", nullable = false, precision = 12, scale = 2)
    private BigDecimal priceSnapshot;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    protected OrderItem() {}

    public OrderItem(Product product, String productNameSnapshot,
                      BigDecimal priceSnapshot, Integer quantity, BigDecimal subtotal) {
        this.product = product;
        this.productNameSnapshot = productNameSnapshot;
        this.priceSnapshot = priceSnapshot;
        this.quantity = quantity;
        this.subtotal = subtotal;
    }

    public OrderItem(Product product, ProductVariant variant, String productNameSnapshot,
                     BigDecimal priceSnapshot, Integer quantity, BigDecimal subtotal) {
        this(product, productNameSnapshot, priceSnapshot, quantity, subtotal);
        this.variant = variant;
        this.variantLabel = variant != null ? variant.getLabel() : null;
    }

    void setOrder(Order order) { this.order = order; }

    public Long getId() { return id; }
    public Order getOrder() { return order; }
    public Product getProduct() { return product; }
    
    public ProductVariant getVariant() { return variant; }
    public String getVariantLabel() { return variantLabel; }
    
    public String getProductNameSnapshot() { return productNameSnapshot; }
    public BigDecimal getPriceSnapshot() { return priceSnapshot; }
    public Integer getQuantity() { return quantity; }
    public BigDecimal getSubtotal() { return subtotal; }
}