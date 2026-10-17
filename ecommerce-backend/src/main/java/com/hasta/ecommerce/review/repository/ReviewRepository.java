package com.hasta.ecommerce.review.repository;

import com.hasta.ecommerce.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Penulis ikut dimuat sekalian, supaya menampilkan 5 ulasan tidak menjalankan 5 query tambahan
    @EntityGraph(attributePaths = "user")
    Page<Review> findByProductId(Long productId, Pageable pageable);

    @EntityGraph(attributePaths = "user")
    Optional<Review> findByProductIdAndUserId(Long productId, Long userId);

    long countByProductId(Long productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double averageRating(@Param("productId") Long productId);
}