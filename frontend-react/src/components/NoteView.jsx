import React, { useState, useEffect, useRef } from 'react';
import SlashMenu from './SlashMenu';
import CategorySelectionModal from './CategorySelectionModal';
import AIAssist from './AIAssist';
import FormattingToolbar from './FormattingToolbar';

const NoteView = ({ note, onUpdateNote, onDeleteNote, categories, onAddNoteToCategory, onAddCategory, onRenameCategory, onDeleteCategory }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashMenuPos, setSlashMenuPos] = useState({ top: 0, left: 0 });
    const [showMenu, setShowMenu] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const textareaRef = useRef(null);

    // Đồng bộ hóa dữ liệu khi chuyển ghi chú
    useEffect(() => {
        if (note) {
            setTitle(note.title || '');
            if (textareaRef.current && textareaRef.current.innerHTML !== note.content) {
                textareaRef.current.innerHTML = note.content || '';
            }
            setContent(note.content || '');
            setShowMenu(false);
        }
    }, [note]);

    const handleSave = (e) => {
        if (e && e.relatedTarget && textareaRef.current && textareaRef.current.contains(e.relatedTarget)) return;
        if (note) {
            const currentContent = textareaRef.current ? textareaRef.current.innerHTML : content;
            onUpdateNote({ ...note, title, content: currentContent });
        }
    };

    // Handle AI result - replace selected text or entire content with AI processed text
    const handleAIResult = (processedText) => {
        if (!textareaRef.current || !processedText) return;

        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();

        if (selectedText && selectedText.length > 0) {
            // Replace selected text
            const range = selection.getRangeAt(0);
            range.deleteContents();
            const textNode = document.createTextNode(processedText);
            range.insertNode(textNode);
        } else {
            // Replace entire content
            textareaRef.current.innerHTML = processedText;
        }

        // Update state and save
        const newContent = textareaRef.current.innerHTML;
        setContent(newContent);
        onUpdateNote({ ...note, title, content: newContent });
    };
    const handleClick = (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
            if (e.target.checked) {
                e.target.setAttribute('checked', 'true');
            } else {
                e.target.removeAttribute('checked');
            }
            const newContent = textareaRef.current.innerHTML;
            setContent(newContent);
            onUpdateNote({ ...note, title, content: newContent });
        }

        // Handle link clicks
        const link = e.target.closest('a');
        if (link && textareaRef.current.contains(link)) {
            // If Ctrl key is pressed or it's a direct click (depending on preference, usually editors require Ctrl+Click)
            // But user asked "cant click to open", implying they expect direct click or easy way.
            // Since it's contentEditable, direct click focuses. 
            // Let's allow opening if it's a link. 
            // To prevent interfering with editing, maybe require Ctrl+Click? 
            // Or just open it? If we just open it, editing the link text becomes hard.
            // Let's try to detect if it was a "navigation" intent.
            // Standard behavior in many editors: Ctrl+Click to open.
            // User said "cant click to open", maybe they tried clicking and nothing happened.

            if (e.ctrlKey || e.metaKey) {
                window.open(link.href, '_blank');
            }
        }
    };

    // Thay thế hàm handleKeyDown cũ bằng đoạn này
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            let currentBlock = range.startContainer;

            while (currentBlock && currentBlock.parentNode !== textareaRef.current && currentBlock !== textareaRef.current) {
                currentBlock = currentBlock.parentNode;
            }

            const hasCheckbox = currentBlock instanceof Element && currentBlock.querySelector('input[type="checkbox"]');

            if (hasCheckbox) {
                e.preventDefault();
                const newCheckboxLine = document.createElement("div");
                // Thêm nbsp; để đảm bảo con trỏ có chỗ đứng
                newCheckboxLine.innerHTML = '<input type="checkbox" style="margin-right: 5px;">&nbsp;';

                currentBlock.parentNode.insertBefore(newCheckboxLine, currentBlock.nextSibling);

                const newRange = document.createRange();
                newRange.setStart(newCheckboxLine, 1); // Đặt con trỏ sau checkbox
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);

                const newContent = textareaRef.current.innerHTML;
                setContent(newContent);
                onUpdateNote({ ...note, title, content: newContent });
            }
        }
    };

    const handleContentChange = (e) => {
        const newVal = e.target.innerHTML;
        setContent(newVal);
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const textNode = range.startContainer;
            if (textNode.nodeType === Node.TEXT_NODE && range.startOffset > 0) {
                const text = textNode.textContent;
                if (text[range.startOffset - 1] === '/') {
                    setShowSlashMenu(true);
                    try {
                        const rect = range.getBoundingClientRect();
                        const wrapperRect = textareaRef.current.parentElement.getBoundingClientRect();
                        setSlashMenuPos({
                            top: `${rect.bottom - wrapperRect.top + 5}px`,
                            left: `${rect.left - wrapperRect.left}px`
                        });
                    } catch {
                        setSlashMenuPos({ top: '150px', left: '20px' });
                    }
                    return;
                }
            }
        }
        setShowSlashMenu(false);
    };

    const fileInputRef = useRef(null);
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target.result;
            if (textareaRef.current) textareaRef.current.focus();
            if (file.type.startsWith('image/')) {
                const imgHtml = `<div><img src="${result}" alt="${file.name}" style="max-width: 100%; border-radius: 4px; margin: 10px 0;" /></div><br>`;
                document.execCommand('insertHTML', false, imgHtml);
            } else {
                const fileHtml = `<a href="${result}" download="${file.name}" contentEditable="false" style="display: inline-flex; align-items: center; padding: 5px 10px; background: #f5f5f5; border-radius: 4px; text-decoration: none; color: #333; margin: 5px 0; cursor: pointer;">📎 ${file.name}</a>&nbsp;`;
                document.execCommand('insertHTML', false, fileHtml);
            }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleSlashSelect = (type) => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const textNode = range.startContainer;
            if (textNode.nodeType === Node.TEXT_NODE && range.startOffset > 0) {
                const text = textNode.textContent;
                if (text[range.startOffset - 1] === '/') {
                    const deleteRange = document.createRange();
                    deleteRange.setStart(textNode, range.startOffset - 1);
                    deleteRange.setEnd(textNode, range.startOffset);
                    selection.removeAllRanges();
                    selection.addRange(deleteRange);
                    deleteRange.deleteContents();
                }
            }
        }
        if (textareaRef.current) textareaRef.current.focus();

        switch (type) {
            case 'h1': document.execCommand('formatBlock', false, 'H1'); break;
            case 'h2': document.execCommand('formatBlock', false, 'H2'); break;
            case 'bullet': document.execCommand('insertUnorderedList'); break;
            case 'number': document.execCommand('insertOrderedList'); break;
            case 'todo': {
                const checkboxHtml = '<div><input type="checkbox" style="margin-right: 5px;">&nbsp;</div>';
                document.execCommand('insertHTML', false, checkboxHtml);
                break;
            }
            case 'separator': document.execCommand('insertHorizontalRule'); break;
            case 'image': fileInputRef.current.accept = "image/*"; fileInputRef.current.click(); break;
            case 'file': fileInputRef.current.accept = "*/*"; fileInputRef.current.click(); break;
            default: break;
        }
        setShowSlashMenu(false);
    };

    if (!note) return <main className="note-view"><div className="note-content-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><p>Chọn một ghi chú để xem</p></div></main>;

    return (
        <main className="note-view" id="noteView">
            <div className="note-header">
                <span id="saveStatus" className="save-status">Đã lưu</span>
                <div className="note-actions">
                    <button className={`star-btn ${note.isImportant ? 'active' : ''}`} onClick={() => onUpdateNote({ ...note, isImportant: !note.isImportant })}>
                        {note.isImportant ? '★' : '☆'}
                    </button>
                    <div className="dropdown">
                        <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>⋮</button>
                        <div className="dropdown-content" style={{ display: showMenu ? 'block' : 'none' }}>
                            <button onClick={() => onDeleteNote(note.id)}>🗑️ Xóa ghi chú</button>
                            <button onClick={() => setShowCategoryModal(true)}>🏷️ Thêm vào danh mục</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="note-scroll-container">
                <div className="note-content-wrapper" style={{ position: 'relative' }}>
                    <input
                        id="noteTitle"
                        className="note-title"
                        placeholder="Tiêu đề ghi chú..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleSave}
                    />

                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />

                    <SlashMenu
                        isOpen={showSlashMenu}
                        position={slashMenuPos}
                        onSelect={handleSlashSelect}
                        onClose={() => setShowSlashMenu(false)}
                    />

                    {/* AI Assist Component - positioned outside content area */}
                    <AIAssist
                        noteContentRef={textareaRef}
                        onApplyResult={handleAIResult}
                    />
                    <div
                        ref={textareaRef}
                        className="note-content"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        data-placeholder="Nội dung ghi chú"
                        onInput={handleContentChange}
                        onClick={handleClick}
                        onKeyDown={handleKeyDown}
                        onBlur={handleSave}
                        style={{ outline: 'none', minHeight: '300px', marginTop: '-20px' }}
                    ></div>
                </div>
            </div>

            {/* Formatting Toolbar - Moved to bottom */}
            <div className="toolbar-container">
                <FormattingToolbar editorRef={textareaRef} />
            </div>

            <CategorySelectionModal
                isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)}
                categories={categories}
                onSelectCategory={(categoryId) => { onAddNoteToCategory(note.id, categoryId); setShowCategoryModal(false); }}
                onAddCategory={onAddCategory} onRenameCategory={onRenameCategory} onDeleteCategory={onDeleteCategory}
            />
        </main>
    );
};

export default NoteView;