package com.hasta.ecommerce.store.entity;

import com.hasta.ecommerce.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stores")
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false, unique = true)
    private User seller;

    @Column(name = "store_name", nullable = false, length = 150)
    private String storeName;

    @Column(nullable = false, unique = true, length = 170)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String city;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected Store() {}

    public Store(User seller, String storeName, String slug, String description, String city) {
        this.seller = seller;
        this.storeName = storeName;
        this.slug = slug;
        this.description = description;
        this.city = city;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public User getSeller() { return seller; }
    public String getStoreName() { return storeName; }
    public String getSlug() { return slug; }
    public String getDescription() { return description; }
    public String getCity() { return city; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}