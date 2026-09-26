package com.hasta.ecommerce.user.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateAddressRequest(
        @NotBlank(message = "recipientName wajib diisi") String recipientName,
        @NotBlank(message = "phone wajib diisi") String phone,
        @NotBlank(message = "addressLine wajib diisi") String addressLine,
        @NotBlank(message = "city wajib diisi") String city,
        @NotBlank(message = "province wajib diisi") String province,
        @NotBlank(message = "postalCode wajib diisi") String postalCode,
        boolean isDefault
) {}