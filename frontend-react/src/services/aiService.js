// AI Assistant Service - API calls to backend
const AI_BASE_URL = 'http://localhost:8080/foundation/ai-assist';

const aiService = {
    async processAI(text, action, targetLanguage = null) {
        try {
            const requestBody = {
                text: text,
                action: action,
                targetLanguage: targetLanguage,
                context: null
            };

            const response = await fetch(`${AI_BASE_URL}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('AI Assist Error:', error);
            return {
                success: false,
                message: 'Lỗi kết nối đến AI: ' + error.message,
                originalText: text,
                processedText: '',
                action: action
            };
        }
    },

    async summarize(text) {
        return await this.processAI(text, 'summarize');
    },

    async proofread(text) {
        return await this.processAI(text, 'proofread');
    },

    async translate(text, targetLang = 'en') {
        return await this.processAI(text, 'translate', targetLang);
    },

    async expand(text) {
        return await this.processAI(text, 'expand');
    }
};

export default aiService;
