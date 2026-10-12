package com.hasta.ecommerce.auth.service;

import com.hasta.ecommerce.common.exception.TooManyAttemptsException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_FAILURES = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final Duration LOCK = Duration.ofMinutes(15);

    private record Attempt(int failures, Instant windowStart, Instant lockedUntil) {}

    private final ConcurrentHashMap<String, Attempt> attempts = new ConcurrentHashMap<>();

    // Dipanggil sebelum memeriksa password. Kalau sedang terkunci, login ditolak tanpa
    // memeriksa password sama sekali (password yang benar pun tetap ditolak selama terkunci).
    public void checkAllowed(String email) {
        Attempt attempt = attempts.get(key(email));
        Instant now = Instant.now();

        if (attempt != null && attempt.lockedUntil() != null && attempt.lockedUntil().isAfter(now)) {
            long minutes = Duration.between(now, attempt.lockedUntil()).toMinutes() + 1;
            throw new TooManyAttemptsException(
                    "Terlalu banyak percobaan login. Coba lagi dalam " + minutes + " menit.");
        }
    }

    public void recordFailure(String email) {
        Instant now = Instant.now();

        attempts.compute(key(email), (k, current) -> {
            boolean expired = current == null
                    || now.isAfter(current.windowStart().plus(WINDOW))
                    || (current.lockedUntil() != null && !current.lockedUntil().isAfter(now));

            Attempt base = expired ? new Attempt(0, now, null) : current;
            int failures = base.failures() + 1;
            Instant lockedUntil = failures >= MAX_FAILURES ? now.plus(LOCK) : null;
            return new Attempt(failures, base.windowStart(), lockedUntil);
        });
    }

    public void reset(String email) {
        attempts.remove(key(email));
    }

    // Membersihkan catatan lama supaya memori tidak membengkak
    @Scheduled(fixedRate = 600_000)
    public void cleanup() {
        Instant now = Instant.now();
        attempts.entrySet().removeIf(e ->
                now.isAfter(e.getValue().windowStart().plus(WINDOW))
                        && (e.getValue().lockedUntil() == null
                            || !e.getValue().lockedUntil().isAfter(now)));
    }

    private String key(String email) {
        return email.trim().toLowerCase();
    }
}