package com.hasta.ecommerce.review.service;

import com.hasta.ecommerce.common.exception.BadRequestException;
import com.hasta.ecommerce.common.exception.ResourceNotFoundException;
import com.hasta.ecommerce.order.entity.OrderStatus;
import com.hasta.ecommerce.order.repository.OrderRepository;
import com.hasta.ecommerce.product.entity.Product;
import com.hasta.ecommerce.product.repository.ProductRepository;
import com.hasta.ecommerce.review.dto.ReviewDto;
import com.hasta.ecommerce.review.dto.ReviewEligibilityDto;
import com.hasta.ecommerce.review.dto.ReviewMapper;
import com.hasta.ecommerce.review.dto.ReviewRequest;
import com.hasta.ecommerce.review.entity.Review;
import com.hasta.ecommerce.review.repository.ReviewRepository;
import com.hasta.ecommerce.user.entity.User;
import com.hasta.ecommerce.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository,
                          UserRepository userRepository, OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public Page<ReviewDto> list(Long productId, Pageable pageable) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product dengan id " + productId + " tidak ditemukan");
        }
        return reviewRepository.findByProductId(productId, pageable).map(ReviewMapper::toDto);
    }

    @Transactional(readOnly = true)
    public ReviewEligibilityDto eligibility(Long userId, Long productId) {
        Product product = findProduct(productId);

        Review mine = reviewRepository.findByProductIdAndUserId(productId, userId).orElse(null);
        if (mine != null) {
            return new ReviewEligibilityDto(false, null, ReviewMapper.toDto(mine));
        }

        String blockedReason = whyCannotReview(userId, product);
        return new ReviewEligibilityDto(blockedReason == null, blockedReason, null);
    }

    public ReviewDto create(Long userId, Long productId, ReviewRequest request) {
        Product product = findProduct(productId);

        String blockedReason = whyCannotReview(userId, product);
        if (blockedReason != null) {
            throw new BadRequestException(blockedReason);
        }
        if (reviewRepository.findByProductIdAndUserId(productId, userId).isPresent()) {
            throw new BadRequestException("Kamu sudah mengulas produk ini. Edit ulasanmu yang sudah ada.");
        }

        User user = userRepository.findByIdOrThrow(userId);
        Review saved = reviewRepository.save(
                new Review(product, user, request.rating(), cleanComment(request.comment())));

        refreshRating(product);
        return ReviewMapper.toDto(saved);
    }

    public ReviewDto update(Long userId, Long reviewId, ReviewRequest request) {
        Review review = findReview(reviewId);

        if (!review.getUser().getId().equals(userId)) {
            throw new BadRequestException("Ulasan ini bukan milik Anda");
        }

        review.update(request.rating(), cleanComment(request.comment()));
        refreshRating(review.getProduct());
        return ReviewMapper.toDto(review);
    }

    public void delete(Long userId, boolean isAdmin, Long reviewId) {
        Review review = findReview(reviewId);

        if (!isAdmin && !review.getUser().getId().equals(userId)) {
            throw new BadRequestException("Ulasan ini bukan milik Anda");
        }

        Product product = review.getProduct();
        reviewRepository.delete(review);
        refreshRating(product);
    }

    // null berarti boleh mengulas; selain itu berisi alasannya
    private String whyCannotReview(Long userId, Product product) {
        if (product.getStore() != null && product.getStore().getSeller().getId().equals(userId)) {
            return "Kamu tidak bisa mengulas produk tokomu sendiri";
        }
        if (orderRepository.countPurchases(userId, product.getId(), OrderStatus.COMPLETED) == 0) {
            return "Ulasan bisa ditulis setelah pesanan yang berisi produk ini selesai";
        }
        return null;
    }

    // Hitung ulang rata-rata dan jumlah ulasan dari data terbaru.
    // Query di bawah otomatis didahului penyimpanan perubahan yang tertunda, jadi ulasan yang
    // baru dibuat, diubah, atau dihapus sudah ikut terhitung.
    private void refreshRating(Product product) {
        long count = reviewRepository.countByProductId(product.getId());
        Double average = reviewRepository.averageRating(product.getId());

        BigDecimal rounded = average == null
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(average).setScale(1, RoundingMode.HALF_UP);

        product.updateRating(rounded, (int) count);
    }

    private String cleanComment(String comment) {
        return comment == null || comment.isBlank() ? null : comment.trim();
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product dengan id " + id + " tidak ditemukan"));
    }

    private Review findReview(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ulasan dengan id " + id + " tidak ditemukan"));
    }
}