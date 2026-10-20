package com.hasta.ecommerce.auth.service;

import com.hasta.ecommerce.common.mail.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

@Service
public class AccountMailService {

    private final EmailService emailService;
    private final String frontendUrl;

    public AccountMailService(EmailService emailService,
                               @Value("${app.frontend-url}") String frontendUrl) {
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
    }

    @Async
    public void sendVerification(String to, String name, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;
        emailService.send(to, "Verifikasi email akun SHOP.CO", template(
                name,
                "Terima kasih sudah mendaftar di SHOP.CO. Klik tombol di bawah untuk memverifikasi emailmu. "
                        + "Tautan berlaku 24 jam.",
                link,
                "Verifikasi Email"));
    }

    @Async
    public void sendPasswordReset(String to, String name, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        emailService.send(to, "Atur ulang password SHOP.CO", template(
                name,
                "Kami menerima permintaan untuk mengatur ulang password akunmu. Klik tombol di bawah untuk "
                        + "membuat password baru. Tautan berlaku 1 jam. Kalau bukan kamu yang memintanya, "
                        + "abaikan email ini dan passwordmu tidak berubah.",
                link,
                "Atur Ulang Password"));
    }

    private String template(String name, String message, String link, String buttonLabel) {
        return """
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #000;">
                  <h2 style="font-size: 22px;">SHOP.CO</h2>
                  <p>Halo %s,</p>
                  <p>%s</p>
                  <p style="margin: 28px 0;">
                    <a href="%s" style="background: #000; color: #fff; padding: 14px 28px;
                       border-radius: 999px; text-decoration: none;">%s</a>
                  </p>
                  <p style="font-size: 13px; color: #666;">Atau salin tautan ini ke browser:<br>%s</p>
                </div>
                """.formatted(HtmlUtils.htmlEscape(name), message, link, buttonLabel, link);
    }
}