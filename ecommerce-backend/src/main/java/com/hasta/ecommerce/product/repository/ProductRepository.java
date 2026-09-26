package com.hasta.ecommerce.product.repository;

import com.hasta.ecommerce.product.entity.Product;
import com.hasta.ecommerce.product.entity.ProductStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // ===== Method lama dari Part 3, TETAP DIPAKAI =====

    Optional<Product> findBySlug(String slug);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.images WHERE p.id = :id")
    Optional<Product> findByIdWithImages(@Param("id") Long id);

    // ===== Method baru Part 9 =====

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    Page<Product> findByStoreIdAndStatus(Long storeId, ProductStatus status, Pageable pageable);

    Page<Product> findByStoreId(Long storeId, Pageable pageable); // buat seller lihat SEMUA produknya (termasuk pending/rejected)

    Page<Product> findByCategoryIdAndStatus(Long categoryId, ProductStatus status, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = :status AND LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Product> searchByNameAndStatus(@Param("keyword") String keyword, @Param("status") ProductStatus status,
            Pageable pageable);
}