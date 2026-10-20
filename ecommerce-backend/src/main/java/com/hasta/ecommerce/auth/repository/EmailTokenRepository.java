package com.hasta.ecommerce.auth.repository;

import com.hasta.ecommerce.auth.entity.EmailToken;
import com.hasta.ecommerce.auth.entity.EmailTokenType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface EmailTokenRepository extends JpaRepository<EmailToken, Long> {

    Optional<EmailToken> findByTokenHashAndType(String tokenHash, EmailTokenType type);

    Optional<EmailToken> findFirstByUserIdAndTypeOrderByCreatedAtDesc(Long userId, EmailTokenType type);

    @Modifying
    @Query("DELETE FROM EmailToken t WHERE t.user.id = :userId AND t.type = :type")
    void deleteByUserAndType(@Param("userId") Long userId, @Param("type") EmailTokenType type);

    @Modifying
    @Query("DELETE FROM EmailToken t WHERE t.expiresAt < :cutoff")
    int deleteExpiredBefore(@Param("cutoff") LocalDateTime cutoff);
}