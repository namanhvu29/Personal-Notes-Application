package FoundationProject.FoundationProject.dto.response;

import FoundationProject.FoundationProject.entity.NoteMedia;
import java.time.LocalDateTime;
import java.util.List;

public class NotesResponse {

    private int note_id;
    private int user_id;
    private String title;
    private String content;
    private boolean is_important;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    //Danh sách file của note
    private List<NoteMedia> mediaFiles;

    public NotesResponse() {}

    public NotesResponse(int note_id, int user_id, String title, String content,
                         boolean is_important, LocalDateTime created_at, LocalDateTime updated_at) {
        this.note_id = note_id;
        this.user_id = user_id;
        this.title = title;
        this.content = content;
        this.is_important = is_important;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    public int getNote_id() {
        return note_id;
    }

    public void setNote_id(int note_id) {
        this.note_id = note_id;
    }

    public int getUser_id() {
        return user_id;
    }

    public void setUser_id(int user_id) {
        this.user_id = user_id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public boolean isIs_important() {
        return is_important;
    }

    public void setIs_important(boolean is_important) {
        this.is_important = is_important;
    }

    public LocalDateTime getCreated_at() {
        return created_at;
    }

    public void setCreated_at(LocalDateTime created_at) {
        this.created_at = created_at;
    }

    public LocalDateTime getUpdated_at() {
        return updated_at;
    }

    public void setUpdated_at(LocalDateTime updated_at) {
        this.updated_at = updated_at;
    }

    public List<NoteMedia> getMediaFiles() {
        return mediaFiles;
    }

    public void setMediaFiles(List<NoteMedia> mediaFiles) {
        this.mediaFiles = mediaFiles;
    }
}
