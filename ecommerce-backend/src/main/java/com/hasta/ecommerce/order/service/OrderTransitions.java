package com.hasta.ecommerce.order.service;

import com.hasta.ecommerce.common.exception.BadRequestException;
import com.hasta.ecommerce.order.entity.OrderStatus;

import java.util.Map;
import java.util.Set;

import static com.hasta.ecommerce.order.entity.OrderStatus.CANCELLED;
import static com.hasta.ecommerce.order.entity.OrderStatus.COMPLETED;
import static com.hasta.ecommerce.order.entity.OrderStatus.PAID;
import static com.hasta.ecommerce.order.entity.OrderStatus.PENDING;
import static com.hasta.ecommerce.order.entity.OrderStatus.SHIPPED;
import static com.hasta.ecommerce.order.service.OrderActor.ADMIN;
import static com.hasta.ecommerce.order.service.OrderActor.CUSTOMER;
import static com.hasta.ecommerce.order.service.OrderActor.SELLER;
import static com.hasta.ecommerce.order.service.OrderActor.SYSTEM;

public final class OrderTransitions {

    // Status asal -> status tujuan -> siapa yang boleh. COMPLETED dan CANCELLED sengaja
    // tidak punya entri: keduanya status akhir.
    private static final Map<OrderStatus, Map<OrderStatus, Set<OrderActor>>> RULES = Map.of(
            PENDING, Map.of(
                    PAID, Set.of(SELLER, ADMIN),
                    CANCELLED, Set.of(CUSTOMER, SELLER, ADMIN)),
            PAID, Map.of(
                    SHIPPED, Set.of(SELLER, ADMIN),
                    CANCELLED, Set.of(SELLER, ADMIN)),
            SHIPPED, Map.of(
                    COMPLETED, Set.of(CUSTOMER, ADMIN, SYSTEM))
    );

    private OrderTransitions() {}

    public static void validate(OrderStatus from, OrderStatus to, OrderActor actor) {
        Map<OrderStatus, Set<OrderActor>> fromHere = RULES.get(from);

        if (fromHere == null || !fromHere.containsKey(to)) {
            throw new BadRequestException(
                    "Pesanan berstatus " + from + " tidak bisa diubah menjadi " + to);
        }
        if (!fromHere.get(to).contains(actor)) {
            throw new BadRequestException("Anda tidak berhak mengubah status ini");
        }
    }
}