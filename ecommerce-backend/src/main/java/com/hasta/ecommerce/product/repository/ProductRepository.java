package com.hasta.ecommerce.product.repository;

import com.hasta.ecommerce.product.entity.Product;
import com.hasta.ecommerce.product.entity.ProductStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

    Page<Product> findByStoreId(Long storeId, Pageable pageable); // buat seller lihat SEMUA produknya (termasuk
                                                                  // pending/rejected)

    Page<Product> findByCategoryIdAndStatus(Long categoryId, ProductStatus status, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = :status AND LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Product> searchByNameAndStatus(@Param("keyword") String keyword, @Param("status") ProductStatus status,
            Pageable pageable);

    // ===== Update Stok Atomik =====

    // Mengurangi stok hanya kalau stok cukup. Mengembalikan jumlah baris yang
    // berubah:
    // 1 berarti berhasil, 0 berarti stok tidak cukup.
    @Modifying
    @Query("UPDATE Product p SET p.stock = p.stock - :qty WHERE p.id = :id AND p.stock >= :qty")
    int decreaseStock(@Param("id") Long id, @Param("qty") int qty);

    @Modifying
    @Query("UPDATE Product p SET p.stock = p.stock + :qty WHERE p.id = :id")
    int increaseStock(@Param("id") Long id, @Param("qty") int qty);

    Page<Product> findByStoreIdAndStatusNot(Long storeId, ProductStatus status, Pageable pageable);

    long countByCategoryId(Long categoryId);

    // Filter kosong dikirim sebagai nilai netral (0, false, ""), bukan null:
    // pola ":param IS NULL" pada PostgreSQL bisa memunculkan error tipe data
    // parameter.
    @Query("""
            SELECT p FROM Product p
            WHERE p.status = :status
              AND (:categoryId = 0 OR p.category.id = :categoryId)
              AND (:onSale = false OR p.discountPercent > 0)
              AND LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
            """)
    Page<Product> browse(@Param("status") ProductStatus status,
            @Param("categoryId") long categoryId,
            @Param("onSale") boolean onSale,
            @Param("keyword") String keyword,
            Pageable pageable);

}