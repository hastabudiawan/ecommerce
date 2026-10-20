package com.hasta.ecommerce.auth.controller;

import com.hasta.ecommerce.auth.dto.AuthResponse;
import com.hasta.ecommerce.auth.dto.ForgotPasswordRequest;
import com.hasta.ecommerce.auth.dto.LoginRequest;
import com.hasta.ecommerce.auth.dto.RegisterRequest;
import com.hasta.ecommerce.auth.dto.ResetPasswordRequest;
import com.hasta.ecommerce.auth.dto.VerifyEmailRequest;
import com.hasta.ecommerce.auth.service.AccountSecurityService;
import com.hasta.ecommerce.auth.service.AuthService;
import com.hasta.ecommerce.common.response.ApiResponse;
import com.hasta.ecommerce.security.SecurityUtils;
import com.hasta.ecommerce.security.service.TokenBlacklistService;
import com.hasta.ecommerce.store.dto.CreateStoreRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final TokenBlacklistService tokenBlacklistService;
    private final AccountSecurityService accountSecurityService;

    public AuthController(AuthService authService, TokenBlacklistService tokenBlacklistService,
                           AccountSecurityService accountSecurityService) {
        this.authService = authService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.accountSecurityService = accountSecurityService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registrasi berhasil", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login berhasil", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        String token = extractToken(request);
        if (token != null) {
            tokenBlacklistService.blacklist(token);
        }
        return ResponseEntity.ok(ApiResponse.success("Logout berhasil", null));
    }

    // Endpoint baru untuk membuka toko
    @PostMapping("/open-store")
    public ResponseEntity<ApiResponse<AuthResponse>> openStore(
            @Valid @RequestBody CreateStoreRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        AuthResponse response = authService.openStore(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Toko berhasil dibuat, akunmu sekarang seller", response));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        accountSecurityService.verifyEmail(request.token());
        return ResponseEntity.ok(ApiResponse.success("Email berhasil diverifikasi", null));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification() {
        Long userId = SecurityUtils.getCurrentUserId();
        accountSecurityService.sendVerification(userId);
        return ResponseEntity.ok(ApiResponse.success("Email verifikasi dikirim", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        accountSecurityService.requestPasswordReset(request.email());
        // Pesan yang sama untuk email terdaftar maupun tidak
        return ResponseEntity.ok(ApiResponse.success(
                "Jika email terdaftar, kami telah mengirim tautan untuk mengatur ulang password", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        accountSecurityService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(ApiResponse.success("Password berhasil diatur ulang. Silakan login.", null));
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}