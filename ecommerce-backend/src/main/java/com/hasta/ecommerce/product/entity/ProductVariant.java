package com.hasta.ecommerce.product.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_variants")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "color_name", length = 50)
    private String colorName;

    @Column(name = "color_hex", length = 7)
    private String colorHex;

    @Column(length = 20)
    private String size;

    @Column(nullable = false)
    private int stock;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected ProductVariant() {}

    public ProductVariant(Product product, String colorName, String colorHex, String size, int stock) {
        this.product = product;
        this.colorName = colorName;
        this.colorHex = colorHex;
        this.size = size;
        this.stock = stock;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void update(String colorName, String colorHex, String size, int stock) {
        this.colorName = colorName;
        this.colorHex = colorHex;
        this.size = size;
        this.stock = stock;
    }

    // "Hitam / L", "L", atau "Hitam", tergantung atribut yang dipakai
    public String getLabel() {
        if (colorName != null && size != null) return colorName + " / " + size;
        return colorName != null ? colorName : size;
    }

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public String getColorName() { return colorName; }
    public String getColorHex() { return colorHex; }
    public String getSize() { return size; }
    public int getStock() { return stock; }
}