package com.hasta.ecommerce.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "currentPassword wajib diisi") String currentPassword,
        @NotBlank(message = "newPassword wajib diisi")
        @Size(min = 8, message = "newPassword minimal 8 karakter") String newPassword
) {}