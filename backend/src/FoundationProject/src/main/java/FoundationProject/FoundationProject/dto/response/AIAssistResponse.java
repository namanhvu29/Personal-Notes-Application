package FoundationProject.FoundationProject.dto.response;

public class AIAssistResponse {
    private String originalText;
    private String processedText;
    private String action;
    private boolean success;
    private String message;

    public AIAssistResponse() {
    }

    public AIAssistResponse(String originalText, String processedText, String action, boolean success, String message) {
        this.originalText = originalText;
        this.processedText = processedText;
        this.action = action;
        this.success = success;
        this.message = message;
    }

    public String getOriginalText() {
        return originalText;
    }

    public void setOriginalText(String originalText) {
        this.originalText = originalText;
    }

    public String getProcessedText() {
        return processedText;
    }

    public void setProcessedText(String processedText) {
        this.processedText = processedText;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
