package FoundationProject.FoundationProject.repository;

import FoundationProject.FoundationProject.entity.AdminHistoryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdminHistoryLogRepository extends JpaRepository<AdminHistoryLog, Long> {
    // Lấy danh sách log mới nhất lên đầu
    List<AdminHistoryLog> findAllByOrderByTimestampDesc();
}