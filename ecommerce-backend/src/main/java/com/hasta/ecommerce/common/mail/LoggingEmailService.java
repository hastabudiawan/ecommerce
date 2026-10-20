package com.hasta.ecommerce.common.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "app.mail.enabled", havingValue = "false", matchIfMissing = true)
public class LoggingEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(LoggingEmailService.class);

    @Override
    public void send(String to, String subject, String htmlBody) {
        log.info("""

                ===== EMAIL (mode log, tidak benar-benar terkirim) =====
                Kepada : {}
                Subjek : {}
                Isi    :
                {}
                ========================================================
                """, to, subject, htmlBody);
    }
}