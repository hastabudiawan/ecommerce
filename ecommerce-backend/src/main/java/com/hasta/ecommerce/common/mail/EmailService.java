package com.hasta.ecommerce.common.mail;

public interface EmailService {
    void send(String to, String subject, String htmlBody);
}