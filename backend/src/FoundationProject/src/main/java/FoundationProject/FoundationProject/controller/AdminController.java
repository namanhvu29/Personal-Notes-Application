package FoundationProject.FoundationProject.controller;

import FoundationProject.FoundationProject.dto.response.AdminDashboardStatsDto;
import FoundationProject.FoundationProject.dto.response.AdminNoteDto;
import FoundationProject.FoundationProject.entity.AdminHistoryLog;
import FoundationProject.FoundationProject.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    //Lấy thống kê (Total Users, Total Notes)
    //URL: GET http://localhost:8080/api/admin/stats
    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardStatsDto> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    //Admin xóa ghi chú
    //URL: DELETE http://localhost:8080/api/admin/notes/{id}
    @DeleteMapping("/notes/{id}")
    public ResponseEntity<String> deleteNote(@PathVariable int id) {
        try {
            adminService.deleteNoteByAdmin(id);
            return ResponseEntity.ok("Đã xóa ghi chú thành công.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

    //Lấy danh sách lịch sử hoạt động
    //URL: GET http://localhost:8080/api/admin/logs
    @GetMapping("/logs")
    public ResponseEntity<List<AdminHistoryLog>> getLogs() {
        return ResponseEntity.ok(adminService.getAllLogs());
    }

    //Lấy danh sách tất cả Notes
    //URL: GET http://localhost:8080/api/admin/notes
    @GetMapping("/notes")
    public ResponseEntity<List<AdminNoteDto>> getAllNotes() {
        List<AdminNoteDto> notes = adminService.getAllNotesForAdmin();
        return ResponseEntity.ok(notes);
    }
}