package FoundationProject.FoundationProject.service;

import FoundationProject.FoundationProject.entity.AdminSetting;
import FoundationProject.FoundationProject.repository.AdminSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SettingsService {

    @Autowired
    private AdminSettingRepository settingRepository;

    // 1. Lấy tất cả cài đặt dưới dạng Map (Key-Value) để Frontend dễ dùng
    public Map<String, String> getAllSettings() {
        List<AdminSetting> list = settingRepository.findAll();
        Map<String, String> map = new HashMap<>();
        for (AdminSetting s : list) {
            map.put(s.getSettingKey(), s.getSettingValue());
        }
        return map;
    }

    // 2. Lưu hoặc cập nhật một nhóm cài đặt
    public void updateSettings(Map<String, String> settings) {
        for (Map.Entry<String, String> entry : settings.entrySet()) {
            AdminSetting setting = new AdminSetting(entry.getKey(), entry.getValue());
            settingRepository.save(setting);
        }
    }

    // 3. Khởi tạo dữ liệu mặc định (nếu chưa có)
    // Bạn có thể gọi hàm này khi ứng dụng start nếu muốn
}