package FoundationProject.FoundationProject.controller;

import FoundationProject.FoundationProject.dto.request.NotesCreationRequest;
import FoundationProject.FoundationProject.dto.request.NotesUpdateRequest;
import FoundationProject.FoundationProject.dto.response.NotesResponse;
import FoundationProject.FoundationProject.entity.NoteLabels;
import FoundationProject.FoundationProject.entity.NoteMedia;
import FoundationProject.FoundationProject.repository.NoteLabelsRepository;
import FoundationProject.FoundationProject.repository.NoteMediaRepository;
import FoundationProject.FoundationProject.service.NotesService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/notes")
@CrossOrigin(origins = "*")
public class NotesController {

    @Autowired
    private NotesService notesService;

    @Autowired
    private NoteLabelsRepository noteLabelsRepository;

    // NEW: Media Repository
    @Autowired
    private NoteMediaRepository noteMediaRepository;

    // -------------------------------------------
    // CRUD Note
    // -------------------------------------------

    @PostMapping
    public ResponseEntity<?> createNote(@RequestBody NotesCreationRequest request) {
        try {
            NotesResponse note = notesService.createNote(request);
            return ResponseEntity.ok(note);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi tạo ghi chú: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllNotes() {
        return ResponseEntity.ok(notesService.getAllNotes());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getNotesByUser(@PathVariable int userId) {
        return ResponseEntity.ok(notesService.getNotesByUserId(userId));
    }

    @GetMapping("/{noteId}")
    public ResponseEntity<?> getNoteById(@PathVariable int noteId) {
        try {
            return ResponseEntity.ok(notesService.getNoteById(noteId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{noteId}")
    public ResponseEntity<?> updateNote(
            @PathVariable int noteId,
            @RequestBody NotesUpdateRequest request) {
        try {
            return ResponseEntity.ok(notesService.updateNote(noteId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<?> deleteNote(@PathVariable int noteId) {
        try {
            notesService.deleteNote(noteId);
            return ResponseEntity.ok("Xóa ghi chú thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------
    // Labels
    // -------------------------------------------

    @PostMapping("/{noteId}/labels")
    @Transactional
    public ResponseEntity<?> assignLabelsToNote(
            @PathVariable int noteId,
            @RequestBody List<Integer> labelIds) {
        try {
            noteLabelsRepository.deleteByNoteId(noteId);
            for (int labelId : labelIds) {
                NoteLabels nl = new NoteLabels();
                nl.setNoteId(noteId);
                nl.setLabelId(labelId);
                noteLabelsRepository.save(nl);
            }
            return ResponseEntity.ok("Đã cập nhật nhãn!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi gán nhãn: " + e.getMessage());
        }
    }

    @GetMapping("/{noteId}/labels")
    public ResponseEntity<?> getLabelsOfNote(@PathVariable int noteId) {
        return ResponseEntity.ok(noteLabelsRepository.findByNoteId(noteId));
    }

    // -------------------------------------------
    // SEARCH
    // -------------------------------------------

    @GetMapping("/user/{userId}/search")
    public ResponseEntity<?> searchNotes(@PathVariable int userId, @RequestParam String keyword) {
        return ResponseEntity.ok(notesService.searchNotes(userId, keyword));
    }

    @GetMapping("/user/{userId}/important")
    public ResponseEntity<?> getImportantNotes(@PathVariable int userId) {
        return ResponseEntity.ok(notesService.getImportantNotes(userId));
    }

// ============================================
// MEDIA (Upload – List – Download – Delete)
// ============================================

    // Upload file + chống trùng tên + giới hạn dung lượng
    @PostMapping("/{noteId}/media")
    public ResponseEntity<?> uploadMedia(
            @PathVariable int noteId,
            @RequestParam("file") MultipartFile file) {

        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File rỗng!");
            }

            // Giới hạn dung lượng 100MB
            long MAX_SIZE = 100 * 1024 * 1024;
            if (file.getSize() > MAX_SIZE) {
                return ResponseEntity.badRequest().body("File vượt quá 100MB!");
            }

            String uploadDir = "uploads/notes/" + noteId;
            Files.createDirectories(Paths.get(uploadDir));

            String originalName = file.getOriginalFilename();
            String baseName = originalName;
            String extension = "";

            // Tách tên + phần mở rộng
            int dotIndex = originalName.lastIndexOf(".");
            if (dotIndex != -1) {
                baseName = originalName.substring(0, dotIndex);
                extension = originalName.substring(dotIndex);
            }

            // CHỐNG TRÙNG TÊN FILE
            String fileName = originalName;
            int index = 1;
            Path filePath = Paths.get(uploadDir, fileName);

            while (Files.exists(filePath)) {
                fileName = baseName + "(" + index + ")" + extension;
                filePath = Paths.get(uploadDir, fileName);
                index++;
            }

            // Ghi file
            Files.write(filePath, file.getBytes());

            // Lưu DB
            NoteMedia media = new NoteMedia();
            media.setNoteId(noteId);
            media.setFileName(fileName);
            media.setFileType(file.getContentType());
            media.setFilePath(filePath.toString());

            noteMediaRepository.save(media);

            return ResponseEntity.ok("Upload thành công!");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi upload: " + e.getMessage());
        }
    }

    // Lấy danh sách media của note
    @GetMapping("/{noteId}/media")
    public ResponseEntity<?> getNoteMedia(@PathVariable int noteId) {
        return ResponseEntity.ok(noteMediaRepository.findByNoteId(noteId));
    }

    // Download file
    @GetMapping("/media/{mediaId}/download")
    public ResponseEntity<?> downloadFile(@PathVariable int mediaId) {
        try {
            NoteMedia media = noteMediaRepository.findById(mediaId).orElseThrow();
            Path path = Paths.get(media.getFilePath());
            byte[] data = Files.readAllBytes(path);

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=" + media.getFileName())
                    .body(data);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi download: " + e.getMessage());
        }
    }

    // Xóa file media
    @DeleteMapping("/media/{mediaId}")
    public ResponseEntity<?> deleteMedia(@PathVariable int mediaId) {
        try {
            NoteMedia media = noteMediaRepository.findById(mediaId).orElseThrow();

            // Xóa file vật lý
            Files.deleteIfExists(Paths.get(media.getFilePath()));

            // Xóa DB
            noteMediaRepository.delete(media);

            return ResponseEntity.ok("Đã xoá file!");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi xoá file: " + e.getMessage());
        }
    }

}
