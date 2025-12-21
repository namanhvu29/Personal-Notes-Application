package FoundationProject.FoundationProject.service;

import FoundationProject.FoundationProject.dto.request.NotesCreationRequest;
import FoundationProject.FoundationProject.dto.request.NotesUpdateRequest;
import FoundationProject.FoundationProject.dto.response.NotesResponse;
import FoundationProject.FoundationProject.entity.NoteMedia;
import FoundationProject.FoundationProject.entity.Notes;
import FoundationProject.FoundationProject.repository.NoteMediaRepository;
import FoundationProject.FoundationProject.repository.NotesRepository;
import FoundationProject.FoundationProject.repository.UsersRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotesService {

    @Autowired
    private NotesRepository notesRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private NoteMediaRepository noteMediaRepository;

    // ============================================
    // CREATE NOTE
    // ============================================
    public NotesResponse createNote(NotesCreationRequest request) {

        if (!usersRepository.existsById(request.getUser_id())) {
            throw new IllegalArgumentException("User không tồn tại!");
        }

        Notes note = new Notes();
        note.setUser_id(request.getUser_id());

        // Xử lý title để tránh trùng
        String baseTitle = (request.getTitle() != null && !request.getTitle().isEmpty())
                ? request.getTitle() : "Untitled";

        String title = baseTitle;
        int counter = 1;

        while (notesRepository.existsByTitleAndUserId(title, request.getUser_id())) {
            title = baseTitle + counter;
            counter++;
        }
        note.setTitle(title);

        note.setContent(request.getContent() != null ? request.getContent() : "");
        note.setIs_important(request.isIs_important());

        Notes savedNote = notesRepository.save(note);
        return convertToResponse(savedNote);
    }

    // ============================================
    // GET NOTES
    // ============================================
    public List<NotesResponse> getNotesByUserId(int userId) {
        return notesRepository.findByUserId(userId)
                .stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public List<NotesResponse> getImportantNotes(int userId) {
        return notesRepository.findByUserIdAndIsImportant(userId)
                .stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public NotesResponse getNoteById(int noteId) {
        Notes note = notesRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note không tồn tại!"));

        NotesResponse res = convertToResponse(note);

        // THÊM MEDIA FILES CHO NOTE
        res.setMediaFiles(noteMediaRepository.findByNoteId(noteId));

        return res;
    }

    public List<NotesResponse> getAllNotes() {
        return notesRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ============================================
    // UPDATE NOTE
    // ============================================
    public NotesResponse updateNote(int noteId, NotesUpdateRequest request) {
        Notes note = notesRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note không tồn tại!"));

        if (request.getTitle() != null && !request.getTitle().isEmpty()) {
            String newTitle = request.getTitle();

            if (notesRepository.existsByTitleAndUserId(newTitle, note.getUser_id())
                    && !newTitle.equals(note.getTitle())) {
                throw new RuntimeException("Note đã tồn tại!");
            }

            note.setTitle(newTitle);
        }

        if (request.getContent() != null) {
            note.setContent(request.getContent());
        }

        note.setIs_important(request.isIs_important());

        Notes updatedNote = notesRepository.save(note);
        return convertToResponse(updatedNote);
    }

    // ============================================
    // DELETE NOTE + DELETE MEDIA
    // ============================================
    public void deleteNote(int noteId) {
        Notes note = notesRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note không tồn tại!"));

        List<NoteMedia> mediaList = noteMediaRepository.findByNoteId(noteId);

        // Xóa file vật lý
        for (NoteMedia media : mediaList) {
            try {
                Files.deleteIfExists(Paths.get(media.getFilePath()));
            } catch (Exception ex) {
                System.out.println("Không thể xóa file: " + media.getFilePath());
            }
        }

        // Xóa media trong DB
        noteMediaRepository.deleteAll(mediaList);

        // Xóa note
        notesRepository.delete(note);
    }

    // ============================================
    // SEARCH NOTES
    // ============================================
    public List<NotesResponse> searchNotes(int userId, String keyword) {
        return notesRepository.searchNotes(userId, keyword)
                .stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    // ============================================
    // CONVERT ENTITY -> DTO
    // ============================================
    private NotesResponse convertToResponse(Notes note) {

        NotesResponse res = new NotesResponse(
                note.getNote_id(),
                note.getUser_id(),
                note.getTitle(),
                note.getContent(),
                note.isIs_important(),
                note.getCreated_at(),
                note.getUpdated_at()
        );

        // THÊM MEDIA FILES CHO MỖI NOTE
        res.setMediaFiles(noteMediaRepository.findByNoteId(note.getNote_id()));

        return res;
    }
}
