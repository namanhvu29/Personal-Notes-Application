import React, { useState, useRef, useEffect } from 'react';
import aiService from '../services/aiService';
import './AIAssist.css';

const AIAssist = ({ noteContentRef, onApplyResult }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState('');
    const [showWarning, setShowWarning] = useState(false);
    const [targetLanguage, setTargetLanguage] = useState('en');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const penRef = useRef(null);
    const chatRef = useRef(null);
    const inputRef = useRef(null);

    // Get working text (selected or entire content)
    const getWorkingText = () => {
        if (!noteContentRef?.current) return '';

        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();

        if (selectedText && selectedText.length > 0) {
            return selectedText;
        }

        // If no selection, use entire note content
        const content = noteContentRef.current.innerHTML || noteContentRef.current.innerText || '';
        // Strip HTML tags to get plain text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        return tempDiv.textContent || tempDiv.innerText || '';
    };

    // Toggle chat widget
    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setResult(null);
            setSelectedAction('');
            setShowWarning(false);
            setInputValue('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    // Handle action pill click
    const handleActionClick = (action) => {
        setSelectedAction(action);
        setShowWarning(false);
    };

    // Handle send message
    const handleSend = async () => {
        // Validate action is selected
        if (!selectedAction) {
            setShowWarning(true);
            return;
        }

        const workingText = getWorkingText().trim();
        const textToProcess = inputValue.trim() || workingText;

        if (!textToProcess) {
            alert('❌ Vui lòng nhập nội dung vào ghi chú hoặc chọn văn bản trước khi sử dụng AI');
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            let response;
            switch (selectedAction) {
                case 'expand':
                    response = await aiService.expand(textToProcess);
                    break;
                case 'summarize':
                    response = await aiService.summarize(textToProcess);
                    break;
                case 'proofread':
                    response = await aiService.proofread(textToProcess);
                    break;
                case 'translate':
                    response = await aiService.translate(textToProcess, targetLanguage);
                    break;
                default:
                    response = { success: false, message: 'Hành động không hợp lệ' };
            }

            if (response.success) {
                setResult(response.processedText);
            } else {
                alert('❌ ' + response.message);
            }
        } catch (error) {
            alert('❌ Lỗi xử lý AI: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle apply result
    const handleApply = () => {
        if (result && onApplyResult) {
            onApplyResult(result);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        }
        handleClose();
    };

    // Handle close
    const handleClose = () => {
        setIsOpen(false);
        setResult(null);
        setSelectedAction('');
        setShowWarning(false);
        setInputValue('');
    };

    // Handle keyboard events
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Auto-resize textarea
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        const textarea = e.target;
        textarea.style.height = 'auto';
        const lineHeight = 20;
        const maxRows = 5;
        const rows = Math.min(Math.ceil(textarea.scrollHeight / lineHeight), maxRows);
        textarea.rows = rows;
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isOpen &&
                chatRef.current &&
                !chatRef.current.contains(e.target) &&
                penRef.current &&
                !penRef.current.contains(e.target)) {
                handleClose();
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    return (
        <>
            {/* Pen Icon Button with Sparkle */}
            <button
                ref={penRef}
                className="ai-copilot-pen"
                onClick={toggleChat}
                title="AI Assistant"
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="white"
                    style={{ display: 'block' }}
                >
                    {/* Pen/Pencil icon */}
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    {/* Sparkle/Star */}
                    <path d="M19 2l.5 1.5L21 4l-1.5.5L19 6l-.5-1.5L17 4l1.5-.5L19 2z" />
                </svg>
            </button>

            {/* Chat Widget */}
            {isOpen && (
                <div
                    ref={chatRef}
                    className="ai-copilot-chat"
                    style={{
                        top: penRef.current ? penRef.current.offsetTop + penRef.current.offsetHeight + 5 : 100,
                        left: penRef.current ? penRef.current.offsetLeft : 8
                    }}
                >
                    <div className="ai-chat-container">
                        {/* Input Area */}
                        <div className="ai-chat-input-wrapper">
                            <textarea
                                ref={inputRef}
                                className="ai-chat-input"
                                placeholder="Nhập chủ đề hoặc nội dung..."
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                rows={1}
                            />
                            <button className="ai-chat-send" onClick={handleSend}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11z" />
                                </svg>
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className={`ai-action-dropdown ${showWarning ? 'warning' : ''}`}>
                            <div className="ai-action-buttons">
                                <button
                                    className={`ai-action-pill ${selectedAction === 'expand' ? 'selected' : ''}`}
                                    onClick={() => handleActionClick('expand')}
                                >
                                    <span className="pill-icon">+</span>
                                    <span>Mở rộng</span>
                                    <span className="pill-expand">^</span>
                                </button>
                                <button
                                    className={`ai-action-pill ${selectedAction === 'summarize' ? 'selected' : ''}`}
                                    onClick={() => handleActionClick('summarize')}
                                >
                                    <span className="pill-icon">^</span>
                                    <span>Tóm tắt</span>
                                </button>
                                <button
                                    className={`ai-action-pill ${selectedAction === 'proofread' ? 'selected' : ''}`}
                                    onClick={() => handleActionClick('proofread')}
                                >
                                    <span className="pill-icon">✓</span>
                                    <span>Sửa lỗi</span>
                                </button>
                                <button
                                    className={`ai-action-pill ${selectedAction === 'translate' ? 'selected' : ''}`}
                                    onClick={() => handleActionClick('translate')}
                                >
                                    <span className="pill-icon">🌐</span>
                                    <span>Dịch</span>
                                </button>
                            </div>
                        </div>

                        {/* Warning */}
                        {showWarning && (
                            <div className="ai-action-warning show">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                                <span>Vui lòng chọn một hành động AI trước khi gửi</span>
                            </div>
                        )}

                        {/* Language Selector */}
                        {selectedAction === 'translate' && (
                            <div className="ai-chat-lang-selector">
                                <select
                                    value={targetLanguage}
                                    onChange={(e) => setTargetLanguage(e.target.value)}
                                >
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
                        )}

                        {/* Loading */}
                        {isLoading && (
                            <div className="ai-chat-loading">
                                <div className="ai-chat-spinner"></div>
                                <span>Đang xử lý...</span>
                            </div>
                        )}

                        {/* Result */}
                        {result && !isLoading && (
                            <div className="ai-chat-result">
                                <div className="ai-result-text">{result}</div>
                                <div className="ai-result-actions">
                                    <button className="ai-result-btn ai-result-apply" onClick={handleApply}>
                                        Áp dụng
                                    </button>
                                    <button className="ai-result-btn ai-result-cancel" onClick={handleClose}>
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Success Feedback */}
            {showSuccess && (
                <div className={`ai-success-feedback ${showSuccess ? 'show' : ''}`}>
                    ✓ Đã áp dụng
                </div>
            )}
        </>
    );
};

export default AIAssist;
