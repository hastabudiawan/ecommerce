package com.hasta.ecommerce.common.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

public class OrderNumberGenerator {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    private OrderNumberGenerator() {
    }

    public static String generate() {
        String datePart = LocalDateTime.now().format(FORMATTER);
        int randomPart = ThreadLocalRandom.current().nextInt(100000, 999999);
        return "ORD-" + datePart + "-" + randomPart;
    }

    public static String generateGroupNumber() {
        String datePart = LocalDateTime.now().format(FORMATTER);
        int randomPart = ThreadLocalRandom.current().nextInt(100000, 999999);
        return "GRP-" + datePart + "-" + randomPart;
    }
}