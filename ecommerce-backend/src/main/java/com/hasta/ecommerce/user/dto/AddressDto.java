package com.hasta.ecommerce.user.dto;

public record AddressDto(
        Long id,
        String recipientName,
        String phone,
        String addressLine,
        String city,
        String province,
        String postalCode,
        boolean isDefault
) {}