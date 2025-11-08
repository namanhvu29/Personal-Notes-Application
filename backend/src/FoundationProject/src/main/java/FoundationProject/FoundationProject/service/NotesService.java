package FoundationProject.FoundationProject.service;

import FoundationProject.FoundationProject.dto.request.NotesCreationRequest;
import FoundationProject.FoundationProject.dto.request.NotesUpdateRequest;
import FoundationProject.FoundationProject.dto.response.NotesResponse;
import FoundationProject.FoundationProject.entity.Notes;
import FoundationProject.FoundationProject.repository.NotesRepository;
import FoundationProject.FoundationProject.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotesService {

    @Autowired
    private NotesRepository notesRepository;

    @Autowired
    private UsersRepository usersRepository;

    // Tạo note mới
    public NotesResponse createNote(NotesCreationRequest request) {
        // Kiểm tra user tồn tại
        if (!usersRepository.existsById(request.getUser_id())) {
            throw new IllegalArgumentException("User không tồn tại!");
        }

        Notes note = new Notes();
        note.setUser_id(request.getUser_id());

        // Xử lý title: nếu trùng thì thêm số thứ tự
        String baseTitle = (request.getTitle() != null && !request.getTitle().isEmpty()) ? request.getTitle() : "Untitled";
        String title = baseTitle;
        int counter = 1;

        while (notesRepository.existsByTitleAndUserId(title, request.getUser_id())) {
            title = baseTitle + counter;
            counter++;
        }
        note.setTitle(title);

        // Set content và trạng thái quan trọng
        note.setContent(request.getContent() != null ? request.getContent() : "");
        note.setIs_important(request.isIs_important());

        Notes savedNote = notesRepository.save(note);
        return convertToResponse(savedNote);
    }

    // Lấy tất cả notes của user
    public List<NotesResponse> getNotesByUserId(int userId) {
        List<Notes> notes = notesRepository.findByUserId(userId);
        return notes.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Lấy notes quan trọng
    public List<NotesResponse> getImportantNotes(int userId) {
        List<Notes> notes = notesRepository.findByUserIdAndIsImportant(userId);
        return notes.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Lấy chi tiết note theo id
    public NotesResponse getNoteById(int noteId) {
        Notes note = notesRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note không tồn tại!"));
        return convertToResponse(note);
    }

    // Cập nhật note
    public NotesResponse updateNote(int noteId, NotesUpdateRequest request) {
        Notes note = notesRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note không tồn tại!"));

        // 1. Update title nếu có
        if (request.getTitle() != null && !request.getTitle().isEmpty()) {
            String newTitle = request.getTitle();

            if (notesRepository.existsByTitleAndUserId(newTitle, note.getUser_id())
                    && !newTitle.equals(note.getTitle())) {
                throw new RuntimeException("Note đã tồn tại!");
            }

            note.setTitle(newTitle);
        }

        // 2. Update content
        if (request.getContent() != null) {
            note.setContent(request.getContent());
        }

        // 3. Update trạng thái quan trọng
        note.setIs_important(request.isIs_important());

        // 4. Lưu
        Notes updatedNote = notesRepository.save(note);
        return convertToResponse(updatedNote);
    }

    // Xóa note
    public void deleteNote(int noteId) {
        if (!notesRepository.existsById(noteId)) {
            throw new RuntimeException("Note không tồn tại!");
        }
        notesRepository.deleteById(noteId);
    }

    // Tìm kiếm notes
    public List<NotesResponse> searchNotes(int userId, String keyword) {
        List<Notes> notes = notesRepository.searchNotes(userId, keyword);
        return notes.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Chuyển đổi entity -> response DTO
    private NotesResponse convertToResponse(Notes note) {
        return new NotesResponse(
                note.getNote_id(),
                note.getUser_id(),
                note.getTitle(),
                note.getContent(),
                note.isIs_important(),
                note.getCreated_at(),
                note.getUpdated_at()
        );
    }
}
