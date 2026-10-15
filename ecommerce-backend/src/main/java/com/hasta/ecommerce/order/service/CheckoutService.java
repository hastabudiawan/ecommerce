package com.hasta.ecommerce.order.service;

import com.hasta.ecommerce.order.dto.CheckoutPreviewDto;
import com.hasta.ecommerce.order.dto.CheckoutRequest;
import com.hasta.ecommerce.order.dto.OrderGroupDto;

public interface CheckoutService {
    OrderGroupDto checkout(Long userId, CheckoutRequest request);
    CheckoutPreviewDto preview(Long userId);

}