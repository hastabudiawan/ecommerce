package com.hasta.ecommerce.user.service;

import com.hasta.ecommerce.auth.dto.AuthResponse;
import com.hasta.ecommerce.common.exception.BadRequestException;
import com.hasta.ecommerce.security.JwtTokenProvider;
import com.hasta.ecommerce.security.service.TokenBlacklistService;
import com.hasta.ecommerce.store.repository.StoreRepository;
import com.hasta.ecommerce.user.dto.AccountDto;
import com.hasta.ecommerce.user.dto.ChangePasswordRequest;
import com.hasta.ecommerce.user.dto.UpdateProfileRequest;
import com.hasta.ecommerce.user.entity.User;
import com.hasta.ecommerce.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AccountService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklistService tokenBlacklistService;

    public AccountService(UserRepository userRepository, StoreRepository storeRepository,
                           PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider,
                           TokenBlacklistService tokenBlacklistService) {
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Transactional(readOnly = true)
    public AccountDto getMe(Long userId) {
        return toDto(userRepository.findByIdOrThrow(userId));
    }

    public AccountDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findByIdOrThrow(userId);
        user.setName(request.name().trim());
        user.setPhone(request.phone() == null || request.phone().isBlank() ? null : request.phone().trim());
        return toDto(user);
    }

    public AuthResponse changePassword(Long userId, String currentToken, ChangePasswordRequest request) {
        User user = userRepository.findByIdOrThrow(userId);

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadRequestException("Password saat ini salah");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new BadRequestException("Password baru tidak boleh sama dengan password saat ini");
        }

        // Mencatat waktu perubahan: semua token yang lebih lama, di perangkat mana pun, ditolak
        user.changePassword(passwordEncoder.encode(request.newPassword()));

        if (currentToken != null) {
            tokenBlacklistService.blacklist(currentToken);
        }

        String role = user.getRole().getName();
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), role);
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), role);
    }

    private AccountDto toDto(User user) {
        return new AccountDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().getName(),
                storeRepository.existsBySellerId(user.getId()),
                user.isEmailVerified(),
                user.getCreatedAt()
        );
    }
}