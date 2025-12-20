package FoundationProject.FoundationProject.controller;

import FoundationProject.FoundationProject.service.SettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
@CrossOrigin(origins = "*")
public class SettingsController {

    @Autowired
    private SettingsService settingsService;

    // GET: Lấy toàn bộ cài đặt để hiển thị lên Form
    @GetMapping
    public ResponseEntity<Map<String, String>> getSettings() {
        return ResponseEntity.ok(settingsService.getAllSettings());
    }

    // POST: Lưu cài đặt (Nhận vào một cục JSON gồm nhiều key-value)
    @PostMapping
    public ResponseEntity<?> saveSettings(@RequestBody Map<String, String> settings) {
        try {
            settingsService.updateSettings(settings);
            return ResponseEntity.ok("Cập nhật cài đặt thành công!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi: " + e.getMessage());
        }
    }
}