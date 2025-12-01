package FoundationProject.FoundationProject.repository;

import FoundationProject.FoundationProject.entity.AdminSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminSettingRepository extends JpaRepository<AdminSetting, String> {
    // Tìm giá trị theo key
    // JpaRepository đã có sẵn findById (chính là findByKey vì Key là ID)
}