package FoundationProject.FoundationProject.repository;

import FoundationProject.FoundationProject.entity.Notes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotesRepository extends JpaRepository<Notes, Integer> {

    // Lấy tất cả notes của một user
    @Query("SELECT n FROM Notes n WHERE n.user_id = :userId")
    List<Notes> findByUserId(@Param("userId") int userId);

    // Lấy notes quan trọng của user
    @Query("SELECT n FROM Notes n WHERE n.user_id = :userId AND n.is_important = true")
    List<Notes> findByUserIdAndIsImportant(@Param("userId") int userId);

    // Tìm kiếm notes theo title hoặc content
    @Query("SELECT n FROM Notes n WHERE n.user_id = :userId AND " +
            "(LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Notes> searchNotes(@Param("userId") int userId, @Param("keyword") String keyword);

    // Đếm số lượng notes của user
    @Query("SELECT COUNT(n) FROM Notes n WHERE n.user_id = :userId")
    long countByUserId(@Param("userId") int userId);

    // Kiểm tra tồn tại note theo title và user
    @Query("SELECT CASE WHEN COUNT(n) > 0 THEN true ELSE false END FROM Notes n " +
            "WHERE n.title = :title AND n.user_id = :userId")
    boolean existsByTitleAndUserId(@Param("title") String title, @Param("userId") int userId);
}
