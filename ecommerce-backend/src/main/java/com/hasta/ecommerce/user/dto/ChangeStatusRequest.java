package com.hasta.ecommerce.user.dto;

import jakarta.validation.constraints.NotNull;

public record ChangeStatusRequest(@NotNull(message = "enabled wajib diisi") Boolean enabled) {}