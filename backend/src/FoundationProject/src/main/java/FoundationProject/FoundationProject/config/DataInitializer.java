package FoundationProject.FoundationProject.config;

import FoundationProject.FoundationProject.entity.AdminSetting;
import FoundationProject.FoundationProject.repository.AdminSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AdminSettingRepository settingRepository;

    @Override
    public void run(String... args) throws Exception {
        // Danh sách các cài đặt mặc định cần có
        List<AdminSetting> defaultSettings = Arrays.asList(
                // System
                new AdminSetting("site_name", "NoteFlow"),
                new AdminSetting("language", "en"),
                new AdminSetting("timezone", "UTC"),
                new AdminSetting("maintenance_mode", "false"),

                // User Management
                new AdminSetting("public_registration", "true"),
                new AdminSetting("email_verification", "true"),
                new AdminSetting("max_notes", "100"),
                new AdminSetting("storage_limit", "500"),

                // Security
                new AdminSetting("min_password", "8"),
                new AdminSetting("session_timeout", "30"),
                new AdminSetting("max_login_attempts", "5"),
                new AdminSetting("log_retention", "90"),

                // Email
                new AdminSetting("smtp_server", "smtp.gmail.com"),
                new AdminSetting("smtp_port", "587"),
                new AdminSetting("email_notifications", "true"),

                // Backup & API
                new AdminSetting("auto_backup", "true"),
                new AdminSetting("backup_frequency", "daily"),
                new AdminSetting("data_retention", "30"),
                new AdminSetting("api_enabled", "true"),
                new AdminSetting("rate_limit", "1000"),

                // Appearance
                new AdminSetting("theme", "light"),
                new AdminSetting("date_format", "dd.mm.yy")
        );

        // Lưu vào DB nếu chưa tồn tại
        for (AdminSetting setting : defaultSettings) {
            if (!settingRepository.existsById(setting.getSettingKey())) {
                settingRepository.save(setting);
            }
        }
        System.out.println(">>> Đã khởi tạo dữ liệu Cài đặt (Settings) thành công!");
    }
}