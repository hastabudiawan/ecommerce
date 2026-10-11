package com.hasta.ecommerce.user.repository;

import com.hasta.ecommerce.common.exception.ResourceNotFoundException;
import com.hasta.ecommerce.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);

    boolean existsByEmail(String email);

    default User findByIdOrThrow(Long id) {
        return findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User dengan id " + id + " tidak ditemukan"));
    }

    @Query("""
            SELECT u FROM User u
            WHERE (:role = '' OR u.role.name = :role)
              AND (LOWER(u.name) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<User> search(@Param("q") String q, @Param("role") String role, Pageable pageable);
}