// ==================== AI BACKEND API ====================
const AIAssist = {
    baseURL: 'http://localhost:8080/foundation/ai-assist',

    async processAI(text, action, targetLanguage = null) {
        try {
            const requestBody = {
                text: text,
                action: action,
                targetLanguage: targetLanguage,
                context: null
            };

            const response = await fetch(`${this.baseURL}/process`, {
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

// ==================== COPILOT-STYLE INLINE AI UI ====================
class CopilotAIAssist {
    constructor() {
        this.noteContent = null;
        this.penIcon = null;
        this.chatWidget = null;
        this.selectedText = '';
        this.selectionRange = { start: 0, end: 0 };
        this.isProcessing = false;
        this.currentAction = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.noteContent = document.getElementById('noteContent');
        if (!this.noteContent) {
            console.error('noteContent element not found');
            return;
        }

        this.createPenIcon();
        this.createChatWidget();
        this.attachEventListeners();
    }

    createPenIcon() {
        const penHTML = `
            <div id="aiCopilotPen" class="ai-copilot-pen">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
            </div>
        `;
        const noteWrapper = document.querySelector('.note-content-wrapper');
        if (noteWrapper) {
            noteWrapper.insertAdjacentHTML('afterbegin', penHTML);
            this.penIcon = document.getElementById('aiCopilotPen');
        }
    }

    createChatWidget() {
        const widgetHTML = `
            <div id="aiCopilotChat" class="ai-copilot-chat" style="display: none;">
                <div class="ai-chat-container">
                    <!-- Chat Input Area -->
                    <div class="ai-chat-input-wrapper">
                        <textarea 
                            id="aiChatInput" 
                            class="ai-chat-input" 
                            placeholder="Nhập chủ đề hoặc nội dung..."
                            rows="1"
                        ></textarea>
                        <button id="aiChatSend" class="ai-chat-send">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11z"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Action Pills (Compact like Claude) -->
                    <div class="ai-action-dropdown" id="aiActionDropdown">
                        <div class="ai-action-buttons">
                            <button type="button" class="ai-action-pill" data-action="expand">
                                <span class="pill-icon">+</span>
                                <span>Mở rộng</span>
                                <span class="pill-expand">^</span>
                            </button>
                            <button type="button" class="ai-action-pill" data-action="summarize">
                                <span class="pill-icon">^</span>
                                <span>Tóm tắt</span>
                            </button>
                            <button type="button" class="ai-action-pill" data-action="proofread">
                                <span class="pill-icon">✓</span>
                                <span>Sửa lỗi</span>
                            </button>
                            <button type="button" class="ai-action-pill" data-action="translate">
                                <span class="pill-icon">🌐</span>
                                <span>Dịch</span>
                            </button>
                        </div>
                        <input type="hidden" id="aiActionSelect" value="">
                    </div>
                    <!-- Warning for no action selected -->
                    <div class="ai-action-warning" id="aiActionWarning">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                        <span>Vui lòng chọn một hành động AI trước khi gửi</span>
                    </div>

                    <!-- Language Selector (for translate action) -->
                    <div id="aiChatLangSelector" class="ai-chat-lang-selector" style="display: none;">
                        <select id="aiChatTargetLang">
                            <option value="en">🇬🇧 English</option>
                            <option value="vi">🇻🇳 Tiếng Việt</option>
                            <option value="ja">🇯🇵 日本語</option>
                            <option value="zh">🇨🇳 中文</option>
                            <option value="ko">🇰🇷 한국어</option>
                            <option value="fr">🇫🇷 Français</option>
                            <option value="de">🇩🇪 Deutsch</option>
                            <option value="es">🇪🇸 Español</option>
                        </select>
                    </div>

                    <!-- Loading Indicator -->
                    <div id="aiChatLoading" class="ai-chat-loading" style="display: none;">
                        <div class="ai-chat-spinner"></div>
                        <span>Đang xử lý...</span>
                    </div>

                    <!-- Result Area -->
                    <div id="aiChatResult" class="ai-chat-result" style="display: none;">
                        <div class="ai-result-text" id="aiChatResultText"></div>
                        <div class="ai-result-actions">
                            <button id="aiResultApply" class="ai-result-btn ai-result-apply">Áp dụng</button>
                            <button id="aiResultCancel" class="ai-result-btn ai-result-cancel">Hủy</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
        this.chatWidget = document.getElementById('aiCopilotChat');
    }

    attachEventListeners() {
        // Pen icon click - always visible, works with selected text or all content
        this.penIcon.addEventListener('click', () => this.showChatWidget());

        // Action pill buttons click handlers
        const actionPills = document.querySelectorAll('.ai-action-pill');
        const actionSelect = document.getElementById('aiActionSelect');

        actionPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = pill.dataset.action;

                // Remove selected from all pills
                actionPills.forEach(p => p.classList.remove('selected'));

                // Add selected to clicked pill
                pill.classList.add('selected');

                // Update hidden input
                actionSelect.value = action;

                // Hide warning if shown
                document.getElementById('aiActionWarning').classList.remove('show');
                document.getElementById('aiActionDropdown').classList.remove('warning');

                // Show language selector for translate, hide for others
                if (action === 'translate') {
                    document.getElementById('aiChatLangSelector').style.display = 'block';
                } else {
                    document.getElementById('aiChatLangSelector').style.display = 'none';
                }
            });
        });

        // Chat input auto-resize
        const chatInput = document.getElementById('aiChatInput');
        chatInput.addEventListener('input', (e) => this.autoResizeInput(e.target));
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage();
            }
        });

        // Send button
        document.getElementById('aiChatSend').addEventListener('click', () => this.sendChatMessage());

        // Result actions
        document.getElementById('aiResultApply').addEventListener('click', () => this.applyResult());
        document.getElementById('aiResultCancel').addEventListener('click', () => this.hideChatWidget());

        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            if (this.chatWidget.style.display === 'block' &&
                !this.chatWidget.contains(e.target) &&
                !this.penIcon.contains(e.target)) {
                this.hideChatWidget();
            }
        });
    }

    getWorkingText() {
        // Check if there's selected text
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText && selectedText.length > 0) {
            this.selectedText = selectedText;
            this.selectionRange = {
                start: this.noteContent.selectionStart,
                end: this.noteContent.selectionEnd
            };
            return selectedText;
        } else {
            // If no selection, use entire note content
            this.selectedText = this.noteContent.value;
            this.selectionRange = {
                start: 0,
                end: this.noteContent.value.length
            };
            return this.noteContent.value;
        }
    }

    showChatWidget() {
        // Get working text (selected or entire content)
        this.getWorkingText();

        const penRect = this.penIcon.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        this.chatWidget.style.display = 'block';
        this.chatWidget.style.top = `${penRect.bottom + scrollTop + 5}px`;
        this.chatWidget.style.left = `${penRect.left + scrollLeft}px`;

        // Focus on input (not dropdown since it's now below)
        document.getElementById('aiChatInput').focus();

        // Hide result if any
        this.hideResult();

        // Reset pill buttons and hidden input
        document.querySelectorAll('.ai-action-pill').forEach(p => p.classList.remove('selected'));
        document.getElementById('aiActionSelect').value = '';
        document.getElementById('aiActionWarning').classList.remove('show');
        document.getElementById('aiActionDropdown').classList.remove('warning');
    }

    hideChatWidget() {
        this.chatWidget.style.display = 'none';
        this.hideResult();
        this.currentAction = null;
        document.getElementById('aiChatLangSelector').style.display = 'none';
        document.getElementById('aiChatInput').value = '';
        document.getElementById('aiChatInput').rows = 1;
        document.getElementById('aiActionSelect').value = '';
        document.querySelectorAll('.ai-action-pill').forEach(p => p.classList.remove('selected'));
        document.getElementById('aiActionWarning').classList.remove('show');
        document.getElementById('aiActionDropdown').classList.remove('warning');
    }

    autoResizeInput(textarea) {
        textarea.style.height = 'auto';
        textarea.rows = 1;
        const lineHeight = 20;
        const maxRows = 5;
        const rows = Math.min(Math.ceil(textarea.scrollHeight / lineHeight), maxRows);
        textarea.rows = rows;
    }

    async sendChatMessage() {
        const input = document.getElementById('aiChatInput');
        const message = input.value.trim();
        const actionSelect = document.getElementById('aiActionSelect');
        const selectedAction = actionSelect.value;

        // Get fresh working text (selected or entire content)
        const workingText = this.getWorkingText().trim();

        // Validate: MUST select an action (required)
        if (!selectedAction) {
            // Show inline warning instead of alert
            document.getElementById('aiActionWarning').classList.add('show');
            document.getElementById('aiActionDropdown').classList.add('warning');
            return;
        }

        // Determine text to process: use message from input if available, otherwise use workingText
        let textToProcess = message || workingText;

        // If we still have no text, show error
        if (!textToProcess || textToProcess.length === 0) {
            this.showError('Vui lòng nhập nội dung vào ghi chú hoặc chọn văn bản trước khi sử dụng AI');
            return;
        }

        if (this.isProcessing) return;

        this.isProcessing = true;
        this.showLoading();
        this.hideResult();

        try {
            let result;

            // If an action is selected, execute that action on the text
            if (selectedAction) {
                switch (selectedAction) {
                    case 'expand':
                        result = await AIAssist.expand(textToProcess);
                        break;
                    case 'summarize':
                        result = await AIAssist.summarize(textToProcess);
                        break;
                    case 'proofread':
                        result = await AIAssist.proofread(textToProcess);
                        break;
                    case 'translate':
                        const targetLang = document.getElementById('aiChatTargetLang').value;
                        result = await AIAssist.translate(textToProcess, targetLang);
                        break;
                }
            } else if (message) {
                // If no action selected but there's a custom message
                // Use the custom message as the main text (allow chat-based interaction)
                // If there's also working text, combine them
                if (workingText && workingText.length > 0 && workingText !== message) {
                    textToProcess = `${workingText}\n\nUser request: ${message}`;
                }
                result = await AIAssist.expand(textToProcess);
            }

            this.hideLoading();

            if (result.success) {
                this.showResult(result.processedText);
            } else {
                this.showError(result.message);
            }

        } catch (error) {
            this.hideLoading();
            this.showError('Lỗi xử lý AI: ' + error.message);
        } finally {
            this.isProcessing = false;
        }
    }

    showLoading() {
        document.getElementById('aiChatLoading').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('aiChatLoading').style.display = 'none';
    }

    showResult(text) {
        const resultDiv = document.getElementById('aiChatResult');
        const resultText = document.getElementById('aiChatResultText');

        resultText.textContent = text;
        resultDiv.style.display = 'block';
        this.processedText = text;
    }

    hideResult() {
        document.getElementById('aiChatResult').style.display = 'none';
        this.processedText = null;
    }

    showError(message) {
        alert('❌ ' + message);
    }

    applyResult() {
        if (!this.processedText) return;

        // Replace selected text with processed text
        const before = this.noteContent.value.substring(0, this.selectionRange.start);
        const after = this.noteContent.value.substring(this.selectionRange.end);
        this.noteContent.value = before + this.processedText + after;

        // Trigger save
        if (window.debouncedSave) {
            window.debouncedSave();
        }

        // Clean up
        this.hideChatWidget();

        // Show success feedback
        this.showSuccessFeedback();
    }

    showSuccessFeedback() {
        const feedback = document.createElement('div');
        feedback.className = 'ai-success-feedback';
        feedback.textContent = '✓ Đã áp dụng';
        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.classList.add('show');
        }, 10);

        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => feedback.remove(), 300);
        }, 2000);
    }
}

// ==================== INITIALIZE ====================
let copilotAI;
document.addEventListener('DOMContentLoaded', () => {
    copilotAI = new CopilotAIAssist();
});
