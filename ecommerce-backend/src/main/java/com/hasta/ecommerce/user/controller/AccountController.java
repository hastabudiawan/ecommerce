package com.hasta.ecommerce.user.controller;

import com.hasta.ecommerce.auth.dto.AuthResponse;
import com.hasta.ecommerce.common.response.ApiResponse;
import com.hasta.ecommerce.security.SecurityUtils;
import com.hasta.ecommerce.user.dto.AccountDto;
import com.hasta.ecommerce.user.dto.ChangePasswordRequest;
import com.hasta.ecommerce.user.dto.UpdateProfileRequest;
import com.hasta.ecommerce.user.service.AccountService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AccountDto>> getMe() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(accountService.getMe(userId)));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<AccountDto>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                "Profil berhasil diperbarui", accountService.updateProfile(userId, request)));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<AuthResponse>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request, HttpServletRequest httpRequest) {
        Long userId = SecurityUtils.getCurrentUserId();
        AuthResponse response = accountService.changePassword(userId, extractToken(httpRequest), request);
        return ResponseEntity.ok(ApiResponse.success("Password berhasil diganti", response));
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        return (header != null && header.startsWith("Bearer ")) ? header.substring(7) : null;
    }
}