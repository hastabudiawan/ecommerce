package com.hasta.ecommerce.review.dto;

import com.hasta.ecommerce.review.entity.Review;

public class ReviewMapper {

    private ReviewMapper() {}

    public static ReviewDto toDto(Review review) {
        return new ReviewDto(
                review.getId(),
                review.getRating(),
                review.getComment(),
                displayName(review.getUser().getName()),
                review.getCreatedAt()
        );
    }

    // "Samantha Dewi Putri" menjadi "Samantha P."; nama satu kata dibiarkan
    static String displayName(String fullName) {
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0];
        }
        return parts[0] + " " + parts[parts.length - 1].charAt(0) + ".";
    }
}