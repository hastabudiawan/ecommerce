package com.hasta.ecommerce.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "token wajib diisi") String token,
        @NotBlank(message = "newPassword wajib diisi")
        @Size(min = 8, message = "newPassword minimal 8 karakter") String newPassword
) {}