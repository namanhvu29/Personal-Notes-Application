package FoundationProject.FoundationProject.service;

import FoundationProject.FoundationProject.dto.request.AIAssistRequest;
import FoundationProject.FoundationProject.dto.response.AIAssistResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class AIAssistService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AIAssistResponse processAIRequest(AIAssistRequest request) {
        try {
            String prompt = buildPrompt(request);
            String geminiResponse = callGeminiAPI(prompt);

            return new AIAssistResponse(
                    request.getText(),
                    geminiResponse,
                    request.getAction(),
                    true,
                    "Xử lý thành công");

        } catch (Exception e) {
            return new AIAssistResponse(
                    request.getText(),
                    "",
                    request.getAction(),
                    false,
                    "Lỗi: " + e.getMessage());
        }
    }

    private String buildPrompt(AIAssistRequest request) {
        String text = request.getText();
        String action = request.getAction();
        
        // Base instruction to avoid AI greetings/closings
        String noGreetingsInstruction = "QUAN TRỌNG: Chỉ trả về kết quả thuần túy. KHÔNG được thêm bất kỳ lời chào, lời mở đầu (như 'Chào bạn', 'Dưới đây là...', 'Tuyệt vời!'), lời kết (như 'Bạn có muốn tôi làm gì nữa không?', 'Hy vọng điều này hữu ích'), hoặc giải thích/nhận xét nào. Chỉ trả về nội dung được yêu cầu.\n\n";

        switch (action.toLowerCase()) {
            case "summarize":
                return noGreetingsInstruction + 
                        "Hãy tóm tắt văn bản sau thành các điểm chính (bullet points) ngắn gọn nhưng đầy đủ ý nghĩa. " +
                        "Chỉ trả về phần tóm tắt, không thêm bất kỳ lời giới thiệu hay giải thích nào:\n\n" + text;

            case "proofread":
                return noGreetingsInstruction + 
                        "Hãy kiểm tra và sửa lỗi chính tả, ngữ pháp, dấu câu cho văn bản sau. " +
                        "Đề xuất cải thiện cách diễn đạt để câu văn rõ ràng và chuyên nghiệp hơn. " +
                        "Chỉ trả về văn bản đã được sửa, không giải thích hay nhận xét gì:\n\n" + text;

            case "translate":
                String targetLang = request.getTargetLanguage() != null ? request.getTargetLanguage() : "en";
                String langName = getLanguageName(targetLang);
                return noGreetingsInstruction + 
                        "Hãy dịch văn bản sau sang " + langName + " một cách tự nhiên và chính xác. " +
                        "Chỉ trả về bản dịch, không thêm bất kỳ lời giới thiệu, giải thích hay chú thích nào:\n\n" + text;

            case "expand":
                return noGreetingsInstruction + 
                        "Dựa trên ý tưởng/câu sau, hãy mở rộng thành các đoạn văn chi tiết hoặc danh sách ý tưởng liên quan. " +
                        "Làm cho nội dung phong phú và hữu ích hơn. Chỉ trả về nội dung mở rộng, không thêm lời mở đầu hay kết thúc:\n\n" + text;

            default:
                return noGreetingsInstruction + "Hãy xử lý văn bản sau:\n\n" + text;
        }
    }


    private String getLanguageName(String langCode) {
        Map<String, String> languages = new HashMap<>();
        languages.put("en", "Tiếng Anh");
        languages.put("vi", "Tiếng Việt");
        languages.put("ja", "Tiếng Nhật");
        languages.put("zh", "Tiếng Trung");
        languages.put("ko", "Tiếng Hàn");
        languages.put("fr", "Tiếng Pháp");
        languages.put("de", "Tiếng Đức");
        languages.put("es", "Tiếng Tây Ban Nha");

        return languages.getOrDefault(langCode, "Tiếng Anh");
    }

    private String callGeminiAPI(String prompt) throws Exception {
        String url = baseUrl + "/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        Map<String, String> parts = new HashMap<>();
        parts.put("text", prompt);

        content.put("parts", new Object[] { parts });
        requestBody.put("contents", new Object[] { content });

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                String.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");

            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode content1 = firstCandidate.path("content");
                JsonNode parts1 = content1.path("parts");

                if (parts1.isArray() && parts1.size() > 0) {
                    return parts1.get(0).path("text").asText();
                }
            }

            throw new Exception("Không thể parse response từ Gemini API");
        } else {
            throw new Exception("Gemini API trả về lỗi: " + response.getStatusCode());
        }
    }
}
