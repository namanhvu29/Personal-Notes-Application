package FoundationProject.FoundationProject.controller;

import FoundationProject.FoundationProject.dto.request.NotesCreationRequest;
import FoundationProject.FoundationProject.dto.request.NotesUpdateRequest;
import FoundationProject.FoundationProject.dto.response.NotesResponse;
import FoundationProject.FoundationProject.service.NotesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notes")
@CrossOrigin(origins = "*")
public class NotesController {

    @Autowired
    private NotesService notesService;

    // Tạo note mới
    @PostMapping
    public ResponseEntity<?> createNote(@RequestBody NotesCreationRequest request) {
        try {
            NotesResponse note = notesService.createNote(request);
            return ResponseEntity.ok(note);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi tạo ghi chú: " + e.getMessage());
        }
    }

    // Lấy tất cả notes của user
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getNotesByUser(@PathVariable int userId) {
        try {
            List<NotesResponse> notes = notesService.getNotesByUserId(userId);
            return ResponseEntity.ok(notes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi lấy danh sách ghi chú: " + e.getMessage());
        }
    }

    // Lấy notes quan trọng của user
    @GetMapping("/user/{userId}/important")
    public ResponseEntity<?> getImportantNotes(@PathVariable int userId) {
        try {
            List<NotesResponse> notes = notesService.getImportantNotes(userId);
            return ResponseEntity.ok(notes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi: " + e.getMessage());
        }
    }

    // Lấy chi tiết 1 note
    @GetMapping("/{noteId}")
    public ResponseEntity<?> getNoteById(@PathVariable int noteId) {
        try {
            NotesResponse note = notesService.getNoteById(noteId);
            return ResponseEntity.ok(note);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi: " + e.getMessage());
        }
    }

    // Cập nhật note
    @PutMapping("/{noteId}")
    public ResponseEntity<?> updateNote(@PathVariable int noteId,
                                        @RequestBody NotesUpdateRequest request) {
        try {
            NotesResponse note = notesService.updateNote(noteId, request);
            return ResponseEntity.ok(note);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi cập nhật: " + e.getMessage());
        }
    }

    // Xóa note
    @DeleteMapping("/{noteId}")
    public ResponseEntity<?> deleteNote(@PathVariable int noteId) {
        try {
            notesService.deleteNote(noteId);
            return ResponseEntity.ok("Xóa ghi chú thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi xóa ghi chú: " + e.getMessage());
        }
    }

    // Tìm kiếm notes
    @GetMapping("/user/{userId}/search")
    public ResponseEntity<?> searchNotes(@PathVariable int userId,
                                         @RequestParam String keyword) {
        try {
            List<NotesResponse> notes = notesService.searchNotes(userId, keyword);
            return ResponseEntity.ok(notes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi tìm kiếm: " + e.getMessage());
        }
    }
}