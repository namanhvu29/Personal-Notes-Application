import React, { useState, useEffect, useRef } from 'react';

const FormattingToolbar = ({ editorRef }) => {
    const [showHeadingMenu, setShowHeadingMenu] = useState(false);
    const [showTextColorMenu, setShowTextColorMenu] = useState(false);
    const [showHighlightMenu, setShowHighlightMenu] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkText, setLinkText] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [currentTextColor, setCurrentTextColor] = useState('#000000');
    const [currentHighlight, setCurrentHighlight] = useState('#FFFF00');

    const [savedSelection, setSavedSelection] = useState(null);

    const headingMenuRef = useRef(null);
    const textColorMenuRef = useRef(null);
    const highlightMenuRef = useRef(null);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (headingMenuRef.current && !headingMenuRef.current.contains(event.target)) {
                setShowHeadingMenu(false);
            }
            if (textColorMenuRef.current && !textColorMenuRef.current.contains(event.target)) {
                setShowTextColorMenu(false);
            }
            if (highlightMenuRef.current && !highlightMenuRef.current.contains(event.target)) {
                setShowHighlightMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formatText = (command, value = null) => {
        if (editorRef.current) {
            editorRef.current.focus();
        }
        document.execCommand(command, false, value);
    };

    const applyHeading = (tag) => {
        formatText('formatBlock', tag);
        setShowHeadingMenu(false);
    };

    const changeTextColor = (color) => {
        setCurrentTextColor(color);
        formatText('foreColor', color);
        setShowTextColorMenu(false);
    };

    const highlightText = (color) => {
        if (color === 'none') {
            formatText('hiliteColor', 'transparent');
        } else {
            setCurrentHighlight(color);
            formatText('hiliteColor', color);
        }
        setShowHighlightMenu(false);
    };

    const insertLink = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            setSavedSelection(selection.getRangeAt(0));
            const selectedText = selection.toString();
            setLinkText(selectedText);
        } else {
            setSavedSelection(null);
            setLinkText('');
        }
        setLinkUrl('');
        setShowLinkModal(true);
    };

    const confirmLink = () => {
        if (linkUrl) {
            if (editorRef.current) {
                editorRef.current.focus();
            }

            // Restore selection
            if (savedSelection) {
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(savedSelection);
            }

            if (linkText && (!savedSelection || savedSelection.toString().length === 0)) {
                document.execCommand('insertHTML', false, `<a href="${linkUrl}" target="_blank">${linkText}</a>`);
            } else {
                document.execCommand('createLink', false, linkUrl);
            }
        }
        closeLinkModal();
    };

    const closeLinkModal = () => {
        setShowLinkModal(false);
        setSavedSelection(null);
        if (editorRef.current) {
            editorRef.current.focus();
        }
    };

    const clearFormatting = () => {
        formatText('removeFormat');
    };

    return (
        <div className="formatting-toolbar" id="formattingToolbar">
            {/* Heading Dropdown */}
            <div className="toolbar-section" ref={headingMenuRef}>
                <div className="heading-dropdown">
                    <button
                        className="toolbar-btn"
                        title="Tiêu đề"
                        onClick={() => setShowHeadingMenu(!showHeadingMenu)}
                    >
                        H ▾
                    </button>
                    <div className={`heading-menu ${showHeadingMenu ? 'show' : ''}`}>
                        <button className="heading-option" onClick={() => applyHeading('p')}>Bình thường</button>
                        <button className="heading-option" onClick={() => applyHeading('h1')}>Heading 1</button>
                        <button className="heading-option" onClick={() => applyHeading('h2')}>Heading 2</button>
                        <button className="heading-option" onClick={() => applyHeading('h3')}>Heading 3</button>
                    </div>
                </div>
            </div>

            <div className="toolbar-divider"></div>

            {/* Basic Formatting */}
            <div className="toolbar-section">
                <button className="toolbar-btn" onClick={() => formatText('bold')} title="In đậm (Ctrl+B)">
                    <strong>B</strong>
                </button>
                <button className="toolbar-btn" onClick={() => formatText('italic')} title="In nghiêng (Ctrl+I)">
                    <em>I</em>
                </button>
                <button className="toolbar-btn" onClick={() => formatText('underline')} title="Gạch chân (Ctrl+U)">
                    <u>U</u>
                </button>
                <button className="toolbar-btn" onClick={() => formatText('strikeThrough')} title="Gạch ngang">
                    <s>S</s>
                </button>
            </div>

            <div className="toolbar-divider"></div>

            {/* Lists */}
            <div className="toolbar-section">
                <button className="toolbar-btn" onClick={() => formatText('insertUnorderedList')} title="Danh sách dấu chấm">
                    • List
                </button>
                <button className="toolbar-btn" onClick={() => formatText('insertOrderedList')} title="Danh sách số">
                    1. List
                </button>
            </div>

            <div className="toolbar-divider"></div>

            {/* Alignment */}
            <div className="toolbar-section">
                <button className="toolbar-btn" onClick={() => formatText('justifyLeft')} title="Căn trái">
                    ☰
                </button>
                <button className="toolbar-btn" onClick={() => formatText('justifyCenter')} title="Căn giữa">
                    ☷
                </button>
                <button className="toolbar-btn" onClick={() => formatText('justifyRight')} title="Căn phải">
                    ☰
                </button>
                <button className="toolbar-btn" onClick={() => formatText('justifyFull')} title="Căn đều hai bên">
                    ☶
                </button>
            </div>

            <div className="toolbar-divider"></div>

            {/* Text Color */}
            <div className="toolbar-section" ref={textColorMenuRef}>
                <div className="color-dropdown">
                    <button
                        className="toolbar-btn color-trigger"
                        title="Màu chữ"
                        onClick={() => setShowTextColorMenu(!showTextColorMenu)}
                    >
                        <span style={{ textDecoration: 'underline', textDecorationColor: currentTextColor, textDecorationThickness: '3px' }}>A</span>
                    </button>
                    <div className={`color-menu ${showTextColorMenu ? 'show' : ''}`}>
                        <div className="color-menu-title">Chọn màu chữ</div>
                        <div className="color-grid">
                            {['#000000', '#FFFFFF', '#808080', '#FF0000', '#FF8C00', '#FFD700', '#00FF00', '#0000FF', '#800080', '#FFC0CB'].map(color => (
                                <button
                                    key={color}
                                    className="color-option"
                                    style={{ background: color, border: color === '#FFFFFF' ? '1px solid #ddd' : 'none' }}
                                    onClick={() => changeTextColor(color)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="toolbar-divider"></div>

            {/* Highlight Color */}
            <div className="toolbar-section" ref={highlightMenuRef}>
                <div className="color-dropdown">
                    <button
                        className="toolbar-btn color-trigger"
                        title="Highlight"
                        onClick={() => setShowHighlightMenu(!showHighlightMenu)}
                    >
                        <span style={{ background: currentHighlight, padding: '2px 6px', borderRadius: '3px' }}>ab</span>
                    </button>
                    <div className={`color-menu ${showHighlightMenu ? 'show' : ''}`}>
                        <div className="color-menu-title">Chọn màu highlight</div>
                        <div className="color-grid highlight-grid">
                            {['#FFFF00', '#87CEEB', '#00FF7F', '#FFB6C1'].map(color => (
                                <button
                                    key={color}
                                    className="highlight-option"
                                    style={{ background: color }}
                                    onClick={() => highlightText(color)}
                                />
                            ))}
                            <button
                                className="highlight-option remove-highlight"
                                style={{ background: 'white', border: '2px solid #ddd' }}
                                title="Xóa highlight"
                                onClick={() => highlightText('none')}
                            >
                                <span style={{ color: '#999', fontSize: '18px' }}>✕</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="toolbar-divider"></div>

            {/* Hyperlink */}
            <div className="toolbar-section">
                <button className="toolbar-btn" onClick={insertLink} title="Chèn liên kết (Ctrl+K)">
                    🔗
                </button>
            </div>

            <div className="toolbar-divider"></div>

            {/* Clear Formatting */}
            <div className="toolbar-section">
                <button className="toolbar-btn clear-btn" onClick={clearFormatting} title="Xóa định dạng">
                    🧹
                </button>
            </div>

            {/* Link Modal */}
            {showLinkModal && (
                <div className="link-modal show">
                    <div className="link-modal-content">
                        <h3>Chèn liên kết</h3>
                        <input
                            type="text"
                            placeholder="Văn bản hiển thị"
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                        />
                        <input
                            type="url"
                            placeholder="https://example.com"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                        />
                        <div className="link-modal-actions">
                            <button onClick={confirmLink}>Chèn</button>
                            <button onClick={closeLinkModal}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormattingToolbar;
