package FoundationProject.FoundationProject.repository;

import FoundationProject.FoundationProject.entity.Labels;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LabelsRepository extends JpaRepository<Labels, Integer> {

    // Lấy tất cả labels của user
    @Query("SELECT l FROM Labels l WHERE l.user_id = :userId")
    List<Labels> findByUserId(@Param("userId") int userId);

    // Tìm kiếm label theo keyword
    @Query("SELECT l FROM Labels l WHERE l.user_id = :userId AND LOWER(l.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Labels> searchLabels(@Param("userId") int userId, @Param("keyword") String keyword);
}
