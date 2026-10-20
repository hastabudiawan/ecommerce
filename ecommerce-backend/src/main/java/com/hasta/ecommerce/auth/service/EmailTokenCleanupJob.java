package com.hasta.ecommerce.auth.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class EmailTokenCleanupJob {

    private final AccountSecurityService accountSecurityService;

    public EmailTokenCleanupJob(AccountSecurityService accountSecurityService) {
        this.accountSecurityService = accountSecurityService;
    }

    // Setiap hari pukul 03.30: buang token yang sudah kedaluwarsa lebih dari 7 hari
    @Scheduled(cron = "0 30 3 * * *")
    public void run() {
        accountSecurityService.cleanupExpired();
    }
}