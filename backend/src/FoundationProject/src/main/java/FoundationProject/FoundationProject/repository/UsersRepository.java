package FoundationProject.FoundationProject.repository;

import FoundationProject.FoundationProject.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsersRepository extends JpaRepository<Users, Integer> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    Users findByUsername(String username);
    Users findByEmail(String email);
}
