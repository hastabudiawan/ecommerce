package com.hasta.ecommerce.review.dto;

// Dipakai frontend untuk memutuskan apa yang ditampilkan di bagian ulasan: form, ulasan milik sendiri, atau keterangan
public record ReviewEligibilityDto(
        boolean canReview,
        String reason,          // alasan kalau tidak bisa mengulas; null kalau bisa atau sudah punya ulasan
        ReviewDto myReview      // ulasan milik pengguna ini untuk produk ini, kalau ada
) {}