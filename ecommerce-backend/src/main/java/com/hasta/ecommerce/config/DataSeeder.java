package com.hasta.ecommerce.config;

import com.hasta.ecommerce.common.util.SlugGenerator;
import com.hasta.ecommerce.product.entity.Category;
import com.hasta.ecommerce.product.entity.Product;
import com.hasta.ecommerce.product.repository.CategoryRepository;
import com.hasta.ecommerce.product.repository.ProductRepository;
import com.hasta.ecommerce.user.entity.Role;
import com.hasta.ecommerce.user.entity.User;
import com.hasta.ecommerce.user.repository.RoleRepository;
import com.hasta.ecommerce.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Profile("!production") // seeder ini TIDAK jalan kalau aplikasi start dengan profile "production"
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.default-password:password123}")
    private String defaultPassword;

    public DataSeeder(UserRepository userRepository, RoleRepository roleRepository,
                       CategoryRepository categoryRepository, ProductRepository productRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUser("ADMIN", "Admin Toko", "admin@example.com", "081234567890");
        seedUser("CUSTOMER", "Customer Test", "customer@example.com", "081234567891");
        seedUser("SELLER", "Seller Test", "seller@example.com", "081234567892");
        seedSampleProduct();
    }

    private void seedUser(String roleName, String name, String email, String phone) {
        if (userRepository.existsByEmail(email)) {
            return;
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException(
                        "Role " + roleName + " tidak ditemukan - pastikan migration V1 sudah jalan"));

        User user = new User(role, name, email, passwordEncoder.encode(defaultPassword), phone);
        userRepository.save(user);
        System.out.println(">>> Seeder: User " + roleName + " dibuat - " + email);
    }

    private void seedSampleProduct() {
        if (categoryRepository.count() > 0) {
            return;
        }

        Category category = new Category(null, "Pakaian", "pakaian");
        categoryRepository.save(category);

        Product product = new Product(
                category, "Kaos Polos Hitam", SlugGenerator.generate("Kaos Polos Hitam"),
                "Kaos katun combed 30s", new BigDecimal("85000"), 100
        );
        productRepository.save(product);
        System.out.println(">>> Seeder: Sample category & product dibuat");
    }
}