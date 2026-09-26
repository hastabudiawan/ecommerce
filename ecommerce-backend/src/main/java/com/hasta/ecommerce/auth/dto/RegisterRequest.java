package com.hasta.ecommerce.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "name wajib diisi")
        String name,

        @NotBlank(message = "email wajib diisi")
        @Email(message = "format email tidak valid")
        String email,

        @NotBlank(message = "password wajib diisi")
        @Size(min = 8, message = "password minimal 8 karakter")
        String password,

        String phone
) {}