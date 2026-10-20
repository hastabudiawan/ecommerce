package com.hasta.ecommerce.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyEmailRequest(@NotBlank(message = "token wajib diisi") String token) {}