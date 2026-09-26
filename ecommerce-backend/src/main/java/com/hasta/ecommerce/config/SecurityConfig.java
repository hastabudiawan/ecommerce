package com.hasta.ecommerce.config;

import com.hasta.ecommerce.security.JwtAuthFilter;
import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, UserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/seller/**").hasRole("SELLER")
                        .requestMatchers(HttpMethod.POST, "/api/products/seller").hasRole("SELLER")
                        .requestMatchers(HttpMethod.PUT, "/api/products/*/approve").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/*/reject").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/products/*/images").hasAnyRole("ADMIN", "SELLER")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/*/images/*").hasAnyRole("ADMIN", "SELLER")
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/seller/store").hasRole("SELLER")
                        .requestMatchers(HttpMethod.GET, "/api/seller/store").hasRole("SELLER")
                        .requestMatchers(HttpMethod.GET, "/api/stores/**").permitAll()
                        .requestMatchers("/api/cart/**").authenticated()
                        .requestMatchers("/api/addresses/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/orders/seller").hasRole("SELLER")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/seller/*/status").hasRole("SELLER")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/*/status").hasRole("ADMIN")
                        .requestMatchers("/api/orders/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/seller/settlements/**").hasRole("SELLER")
                        .requestMatchers(HttpMethod.PUT, "/api/admin/settlements/*/release").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}