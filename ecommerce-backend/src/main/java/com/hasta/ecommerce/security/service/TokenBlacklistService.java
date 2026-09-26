package com.hasta.ecommerce.security.service;

import com.hasta.ecommerce.security.JwtTokenProvider;
import com.hasta.ecommerce.security.entity.BlacklistedToken;
import com.hasta.ecommerce.security.repository.BlacklistedTokenRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class TokenBlacklistService {

    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public TokenBlacklistService(BlacklistedTokenRepository blacklistedTokenRepository,
            JwtTokenProvider jwtTokenProvider) {
        this.blacklistedTokenRepository = blacklistedTokenRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public void blacklist(String token) {
        if (blacklistedTokenRepository.existsByToken(token)) {
            return; // sudah di-blacklist sebelumnya, tidak perlu insert lagi
        }
        LocalDateTime expiry = jwtTokenProvider.getExpiryFromToken(token);
        blacklistedTokenRepository.save(new BlacklistedToken(token, expiry));
    }

    public boolean isBlacklisted(String token) {
        return blacklistedTokenRepository.existsByToken(token);
    }

    // Dipanggil terjadwal (lihat bagian 9) buat bersihin baris yang tokennya sudah
    // pasti expired
    public void cleanupExpired() {
        blacklistedTokenRepository.deleteAllExpired(LocalDateTime.now());
    }

    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 3 * * *") // tiap jam 3 pagi
    public void scheduledCleanup() {
        cleanupExpired();
    }
}