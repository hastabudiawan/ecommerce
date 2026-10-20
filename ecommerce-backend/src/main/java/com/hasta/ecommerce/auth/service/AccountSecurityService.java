package com.hasta.ecommerce.auth.service;

import com.hasta.ecommerce.auth.entity.EmailToken;
import com.hasta.ecommerce.auth.entity.EmailTokenType;
import com.hasta.ecommerce.auth.repository.EmailTokenRepository;
import com.hasta.ecommerce.common.exception.BadRequestException;
import com.hasta.ecommerce.user.entity.User;
import com.hasta.ecommerce.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

@Service
@Transactional
public class AccountSecurityService {

    private static final Duration VERIFY_TTL = Duration.ofHours(24);
    private static final Duration RESET_TTL = Duration.ofHours(1);
    private static final Duration COOLDOWN = Duration.ofSeconds(60);
    private static final String INVALID_LINK = "Tautan tidak valid atau sudah kedaluwarsa";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final EmailTokenRepository emailTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccountMailService mailService;
    private final LoginAttemptService loginAttemptService;

    public AccountSecurityService(UserRepository userRepository, EmailTokenRepository emailTokenRepository,
                                   PasswordEncoder passwordEncoder, AccountMailService mailService,
                                   LoginAttemptService loginAttemptService) {
        this.userRepository = userRepository;
        this.emailTokenRepository = emailTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailService = mailService;
        this.loginAttemptService = loginAttemptService;
    }

    // ---------- Verifikasi email ----------

    // Dipanggil setelah pendaftaran, dan dari tombol "kirim ulang"
    public void sendVerification(Long userId) {
        User user = userRepository.findByIdOrThrow(userId);

        if (user.isEmailVerified()) {
            throw new BadRequestException("Email sudah terverifikasi");
        }
        if (isWithinCooldown(userId, EmailTokenType.VERIFY_EMAIL)) {
            throw new BadRequestException("Tunggu sebentar (sekitar 1 menit) sebelum meminta email lagi");
        }

        String rawToken = issueToken(user, EmailTokenType.VERIFY_EMAIL, VERIFY_TTL);
        mailService.sendVerification(user.getEmail(), user.getName(), rawToken);
    }

    public void verifyEmail(String rawToken) {
        EmailToken token = findUsableToken(rawToken, EmailTokenType.VERIFY_EMAIL);

        token.markUsed();
        token.getUser().setEmailVerified(true);
    }

    // ---------- Lupa password ----------

    // Tidak pernah memberi tahu pemanggil apakah email terdaftar: kalau tidak ada atau terlalu
    // sering diminta, method ini diam saja, dan controller tetap membalas pesan yang sama.
    public void requestPasswordReset(String email) {
        userRepository.findByEmail(email.trim()).ifPresent(user -> {
            if (!user.isEnabled() || isWithinCooldown(user.getId(), EmailTokenType.RESET_PASSWORD)) {
                return;
            }

            String rawToken = issueToken(user, EmailTokenType.RESET_PASSWORD, RESET_TTL);
            mailService.sendPasswordReset(user.getEmail(), user.getName(), rawToken);
        });
    }

    public void resetPassword(String rawToken, String newPassword) {
        EmailToken token = findUsableToken(rawToken, EmailTokenType.RESET_PASSWORD);
        User user = token.getUser();

        // Mencatat waktu perubahan: semua sesi login lama otomatis tidak berlaku lagi
        user.changePassword(passwordEncoder.encode(newPassword));
        token.markUsed();

        // Menerima tautan ini membuktikan pemilik emailnya, dan kunci login
        // karena salah password (Part 14) ikut dibuka
        user.setEmailVerified(true);
        loginAttemptService.reset(user.getEmail());
    }

    // ---------- Pembersihan ----------

    public int cleanupExpired() {
        return emailTokenRepository.deleteExpiredBefore(LocalDateTime.now().minusDays(7));
    }

    // ---------- Helper ----------

    private boolean isWithinCooldown(Long userId, EmailTokenType type) {
        return emailTokenRepository.findFirstByUserIdAndTypeOrderByCreatedAtDesc(userId, type)
                .map(t -> t.getCreatedAt().isAfter(LocalDateTime.now().minus(COOLDOWN)))
                .orElse(false);
    }

    // Membuat token baru; token lama yang belum dipakai untuk akun dan jenis yang sama dibuang
    private String issueToken(User user, EmailTokenType type, Duration ttl) {
        emailTokenRepository.deleteByUserAndType(user.getId(), type);

        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        emailTokenRepository.save(new EmailToken(user, type, sha256(rawToken), LocalDateTime.now().plus(ttl)));
        return rawToken;
    }

    private EmailToken findUsableToken(String rawToken, EmailTokenType type) {
        EmailToken token = emailTokenRepository.findByTokenHashAndType(sha256(rawToken), type)
                .orElseThrow(() -> new BadRequestException(INVALID_LINK));

        if (!token.isUsable(LocalDateTime.now())) {
            throw new BadRequestException(INVALID_LINK);
        }
        return token;
    }

    private static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 tidak tersedia", e);
        }
    }
}