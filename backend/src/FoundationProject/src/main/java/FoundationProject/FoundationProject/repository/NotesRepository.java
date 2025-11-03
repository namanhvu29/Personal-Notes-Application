package FoundationProject.FoundationProject.repository;

import FoundationProject.FoundationProject.entity.Notes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotesRepository extends JpaRepository<Notes, Integer> {

    // Tìm tất cả notes của một user (dùng @Query thay vì method name)
    @Query("SELECT n FROM Notes n WHERE n.user_id = :userId")
    List<Notes> findByUserId(@Param("userId") int userId);

    // Tìm notes quan trọng của user
    @Query("SELECT n FROM Notes n WHERE n.user_id = :userId AND n.is_important = :isImportant")
    List<Notes> findByUserIdAndIsImportant(@Param("userId") int userId, @Param("isImportant") boolean isImportant);

    // Tìm kiếm notes theo title hoặc content
    @Query("SELECT n FROM Notes n WHERE n.user_id = :userId AND " +
            "(LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Notes> searchNotes(@Param("userId") int userId, @Param("keyword") String keyword);

    // Đếm số lượng notes của user
    @Query("SELECT COUNT(n) FROM Notes n WHERE n.user_id = :userId")
    long countByUserId(@Param("userId") int userId);
}