package FoundationProject.FoundationProject.controller;

import FoundationProject.FoundationProject.entity.Labels;
import FoundationProject.FoundationProject.service.LabelsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/labels")
@CrossOrigin(origins = "*")
public class LabelsController {

    @Autowired
    private LabelsService labelsService;

    @PostMapping("/user/{userId}")
    public ResponseEntity<?> createLabel(@PathVariable int userId, @RequestParam String name) {
        try {
            Labels label = labelsService.createLabel(userId, name);
            return ResponseEntity.ok(label);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi tạo nhãn: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getLabelsByUser(@PathVariable int userId) {
        return ResponseEntity.ok(labelsService.getLabelsByUser(userId));
    }

    @GetMapping("/user/{userId}/search")
    public ResponseEntity<?> searchLabels(@PathVariable int userId, @RequestParam String keyword) {
        return ResponseEntity.ok(labelsService.searchLabels(userId, keyword));
    }

    @DeleteMapping("/{labelId}")
    public ResponseEntity<?> deleteLabel(@PathVariable int labelId) {
        try {
            labelsService.deleteLabel(labelId);
            return ResponseEntity.ok("Đã xóa nhãn");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi xóa nhãn: " + e.getMessage());
        }
    }
}
