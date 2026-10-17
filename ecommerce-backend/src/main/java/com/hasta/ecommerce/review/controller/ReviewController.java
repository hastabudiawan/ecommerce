package com.hasta.ecommerce.review.controller;

import com.hasta.ecommerce.common.response.ApiResponse;
import com.hasta.ecommerce.common.response.PageResponse;
import com.hasta.ecommerce.review.dto.ReviewDto;
import com.hasta.ecommerce.review.dto.ReviewEligibilityDto;
import com.hasta.ecommerce.review.dto.ReviewRequest;
import com.hasta.ecommerce.review.service.ReviewService;
import com.hasta.ecommerce.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<ApiResponse<PageResponse<ReviewDto>>> list(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ReviewDto> result = reviewService.list(productId, pageable);
        return ResponseEntity.ok(ApiResponse.success(new PageResponse<>(result)));
    }

    @GetMapping("/products/{productId}/reviews/me")
    public ResponseEntity<ApiResponse<ReviewEligibilityDto>> eligibility(@PathVariable Long productId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(reviewService.eligibility(userId, productId)));
    }

    @PostMapping("/products/{productId}/reviews")
    public ResponseEntity<ApiResponse<ReviewDto>> create(
            @PathVariable Long productId, @Valid @RequestBody ReviewRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Ulasan berhasil dikirim", reviewService.create(userId, productId, request)));
    }

    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewDto>> update(
            @PathVariable Long reviewId, @Valid @RequestBody ReviewRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                "Ulasan berhasil diubah", reviewService.update(userId, reviewId, request)));
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long reviewId) {
        Long userId = SecurityUtils.getCurrentUserId();
        reviewService.delete(userId, SecurityUtils.hasRole("ADMIN"), reviewId);
        return ResponseEntity.ok(ApiResponse.success("Ulasan berhasil dihapus", null));
    }
}