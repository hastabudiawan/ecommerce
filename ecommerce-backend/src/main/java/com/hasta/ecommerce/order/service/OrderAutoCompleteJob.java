package com.hasta.ecommerce.order.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class OrderAutoCompleteJob {

    private static final Logger log = LoggerFactory.getLogger(OrderAutoCompleteJob.class);

    private final OrderService orderService;
    private final int days;

    public OrderAutoCompleteJob(OrderService orderService,
                                 @Value("${app.orders.auto-complete-days:7}") int days) {
        this.orderService = orderService;
        this.days = days;
    }

    // Setiap hari pukul 02.00
    @Scheduled(cron = "0 0 2 * * *")
    public void run() {
        int completed = orderService.autoCompleteShipped(days);
        if (completed > 0) {
            log.info("{} pesanan dikirim lebih dari {} hari diselesaikan otomatis", completed, days);
        }
    }
}