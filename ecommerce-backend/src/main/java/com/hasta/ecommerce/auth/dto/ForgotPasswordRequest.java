package com.hasta.ecommerce.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "email wajib diisi")
        @Email(message = "format email tidak valid") String email
) {}