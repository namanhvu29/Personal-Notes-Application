package FoundationProject.FoundationProject.dto.request;

public class AIAssistRequest {
    private String text;
    private String action;
    private String targetLanguage;
    private String context;

    public AIAssistRequest() {
    }

    public AIAssistRequest(String text, String action, String targetLanguage, String context) {
        this.text = text;
        this.action = action;
        this.targetLanguage = targetLanguage;
        this.context = context;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getTargetLanguage() {
        return targetLanguage;
    }

    public void setTargetLanguage(String targetLanguage) {
        this.targetLanguage = targetLanguage;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }
}
