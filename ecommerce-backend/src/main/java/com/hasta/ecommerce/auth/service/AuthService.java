package com.hasta.ecommerce.auth.service;

import com.hasta.ecommerce.auth.dto.AuthResponse;
import com.hasta.ecommerce.auth.dto.LoginRequest;
import com.hasta.ecommerce.auth.dto.RegisterRequest;
import com.hasta.ecommerce.common.exception.BadRequestException;
import com.hasta.ecommerce.common.exception.ResourceNotFoundException;
import com.hasta.ecommerce.security.JwtTokenProvider;
import com.hasta.ecommerce.store.dto.CreateStoreRequest;
import com.hasta.ecommerce.store.service.StoreService;
import com.hasta.ecommerce.user.entity.Role;
import com.hasta.ecommerce.user.entity.User;
import com.hasta.ecommerce.user.repository.RoleRepository;
import com.hasta.ecommerce.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final StoreService storeService;
    private final LoginAttemptService loginAttemptService;
    private final AccountSecurityService accountSecurityService;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
                        PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
                        JwtTokenProvider jwtTokenProvider, StoreService storeService,
                        LoginAttemptService loginAttemptService,
                        AccountSecurityService accountSecurityService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.storeService = storeService;
        this.loginAttemptService = loginAttemptService;
        this.accountSecurityService = accountSecurityService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email sudah terdaftar");
        }

        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role CUSTOMER tidak ditemukan, pastikan seed data roles sudah ada"));

        User user = new User(
                customerRole,
                request.name(),
                request.email(),
                passwordEncoder.encode(request.password()),
                request.phone());
        user.setEmailVerified(false);

        User saved = userRepository.save(user);
        accountSecurityService.sendVerification(saved.getId());

        String token = jwtTokenProvider.generateToken(saved.getId(), saved.getEmail(), customerRole.getName());
        return new AuthResponse(token, saved.getId(), saved.getName(), saved.getEmail(), customerRole.getName());
    }

    public AuthResponse login(LoginRequest request) {
        loginAttemptService.checkAllowed(request.email());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (BadCredentialsException e) {
            loginAttemptService.recordFailure(request.email());
            throw e;
        }

        loginAttemptService.reset(request.email());

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().getName());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().getName());
    }

    @Transactional
    public AuthResponse openStore(Long userId, CreateStoreRequest request) {
        User user = userRepository.findByIdOrThrow(userId);

        if (!"CUSTOMER".equals(user.getRole().getName())) {
            throw new BadRequestException("Hanya akun customer yang bisa membuka toko");
        }

        storeService.createStore(userId, request);

        Role sellerRole = roleRepository.findByName("SELLER")
                .orElseThrow(() -> new ResourceNotFoundException("Role SELLER tidak ditemukan"));
        user.setRole(sellerRole);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), sellerRole.getName());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), sellerRole.getName());
    }
}