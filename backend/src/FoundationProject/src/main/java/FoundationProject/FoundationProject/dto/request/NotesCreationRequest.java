package FoundationProject.FoundationProject.dto.request;

public class NotesCreationRequest {
    private int user_id;
    private String title;
    private String content;
    private boolean is_important = false;

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
}