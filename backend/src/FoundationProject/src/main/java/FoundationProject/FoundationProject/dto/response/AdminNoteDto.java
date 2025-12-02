package FoundationProject.FoundationProject.dto.response;

import java.time.LocalDateTime;

public class AdminNoteDto {
    private int noteId;
    private String title;
    private String content;
    private String createdBy; // Tên người dùng (Username)
    private LocalDateTime createdAt;

    public AdminNoteDto(int noteId, String title, String content, String createdBy, LocalDateTime createdAt) {
        this.noteId = noteId;
        this.title = title;
        this.content = content;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    public int getNoteId() { return noteId; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public String getCreatedBy() { return createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}