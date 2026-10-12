package com.hasta.ecommerce.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "name wajib diisi")
        @Size(max = 100, message = "name maksimal 100 karakter") String name,
        @Size(max = 20, message = "phone maksimal 20 karakter") String phone
) {}