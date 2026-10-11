package com.hasta.ecommerce.user.dto;

import jakarta.validation.constraints.NotBlank;

public record ChangeRoleRequest(@NotBlank(message = "role wajib diisi") String role) {}