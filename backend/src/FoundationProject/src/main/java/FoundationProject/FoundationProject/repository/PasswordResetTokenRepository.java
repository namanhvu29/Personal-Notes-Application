package FoundationProject.FoundationProject.repository;

import FoundationProject.FoundationProject.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Integer> {
    Optional<PasswordResetToken> findByEmailAndResetCodeAndUsedFalse(String email, String resetCode);

    void deleteByEmail(String email);
}
