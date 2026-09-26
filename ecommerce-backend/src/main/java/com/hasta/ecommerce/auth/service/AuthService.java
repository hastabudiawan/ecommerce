package com.hasta.ecommerce.auth.service;

import com.hasta.ecommerce.auth.dto.AuthResponse;
import com.hasta.ecommerce.auth.dto.LoginRequest;
import com.hasta.ecommerce.auth.dto.RegisterRequest;
import com.hasta.ecommerce.common.exception.BadRequestException;
import com.hasta.ecommerce.common.exception.ResourceNotFoundException;
import com.hasta.ecommerce.security.JwtTokenProvider;
import com.hasta.ecommerce.user.entity.Role;
import com.hasta.ecommerce.user.entity.User;
import com.hasta.ecommerce.user.repository.RoleRepository;
import com.hasta.ecommerce.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
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

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
            PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
            JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email sudah terdaftar");
        }

        // Default role user baru: CUSTOMER. Role ADMIN cuma bisa di-assign manual lewat
        // database
        // atau lewat endpoint khusus yang dilindungi (di luar scope tutorial ini).
        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role CUSTOMER tidak ditemukan, pastikan seed data roles sudah ada"));

        User user = new User(
                customerRole,
                request.name(),
                request.email(),
                passwordEncoder.encode(request.password()),
                request.phone());
        User saved = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(saved.getId(), saved.getEmail(), customerRole.getName());
        return new AuthResponse(token, saved.getId(), saved.getName(), saved.getEmail(), customerRole.getName());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        // Kalau baris di atas tidak throw exception, berarti email+password valid

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().getName());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().getName());
    }
}