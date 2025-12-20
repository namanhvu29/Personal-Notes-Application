package FoundationProject.FoundationProject.controller;

import FoundationProject.FoundationProject.dto.request.AIAssistRequest;
import FoundationProject.FoundationProject.dto.response.AIAssistResponse;
import FoundationProject.FoundationProject.service.AIAssistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai-assist")
@CrossOrigin(origins = "*")
public class AIAssistController {

    @Autowired
    private AIAssistService aiAssistService;

    @PostMapping("/process")
    public ResponseEntity<AIAssistResponse> processAI(@RequestBody AIAssistRequest request) {
        try {
            if (request.getText() == null || request.getText().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        new AIAssistResponse("", "", request.getAction(), false, "Văn bản không được để trống"));
            }

            if (request.getAction() == null || request.getAction().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        new AIAssistResponse(request.getText(), "", "", false, "Action không được để trống"));
            }

            AIAssistResponse response = aiAssistService.processAIRequest(request);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    new AIAssistResponse(
                            request != null ? request.getText() : "",
                            "",
                            request != null ? request.getAction() : "",
                            false,
                            "Lỗi server: " + e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("AI Assist Service is running!");
    }
}
