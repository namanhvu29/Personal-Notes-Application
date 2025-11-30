import React, { useState, useEffect, useRef } from 'react';
import SlashMenu from './SlashMenu';
import CategorySelectionModal from './CategorySelectionModal';

const NoteView = ({ note, onUpdateNote, onDeleteNote, categories, onAddNoteToCategory, onAddCategory, onRenameCategory, onDeleteCategory }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashMenuPos, setSlashMenuPos] = useState({ top: 0, left: 0 });
    const [showMenu, setShowMenu] = useState(false); // State for dropdown menu
    const [showCategoryModal, setShowCategoryModal] = useState(false); // State for category modal
    const textareaRef = useRef(null);

    useEffect(() => {
        if (note) {
            setTitle(note.title || '');
            // Only update content if it's different to avoid cursor jumping
            if (textareaRef.current && textareaRef.current.innerHTML !== note.content) {
                textareaRef.current.innerHTML = note.content || '';
            }
            setContent(note.content || '');
            setShowMenu(false); // Close menu when switching notes
        }
    }, [note]);

    const handleSave = (e) => {
        // Prevent save if moving focus within the editor (e.g. to a checkbox)
        if (e && e.relatedTarget && textareaRef.current && textareaRef.current.contains(e.relatedTarget)) {
            return;
        }

        if (note) {
            // Read latest content directly from DOM to ensure we have the most up-to-date version
            const currentContent = textareaRef.current ? textareaRef.current.innerHTML : content;
            onUpdateNote({ ...note, title, content: currentContent });
        }
    };



    const handleClick = (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
            // Toggle the checked attribute explicitly in the DOM
            if (e.target.checked) {
                e.target.setAttribute('checked', 'true');
            } else {
                e.target.removeAttribute('checked');
            }

            // Update content state AND trigger save immediately
            // This ensures the checkbox state is persisted even if the user navigates away immediately
            if (textareaRef.current) {
                const newContent = textareaRef.current.innerHTML;
                setContent(newContent);
                onUpdateNote({ ...note, title, content: newContent });
            }
        } else if (e.target.tagName === 'A' && e.target.hasAttribute('download')) {
            // Force download for file attachments inside contentEditable
            // We create a temporary link to ensure the download triggers correctly
            // without interfering with the editor's focus management too much.
            e.preventDefault(); // Prevent default navigation/focus behavior
            const tempLink = document.createElement('a');
            tempLink.href = e.target.href;
            tempLink.download = e.target.download;
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const startNode = range.startContainer;

                // Find the parent block element (div, p, li, h1, h2)
                let currentBlock = startNode;
                while (currentBlock && currentBlock.parentNode !== textareaRef.current && currentBlock !== textareaRef.current) {
                    currentBlock = currentBlock.parentNode;
                }

                if (currentBlock && currentBlock !== textareaRef.current) {
                    const tagName = currentBlock.tagName.toLowerCase();

                    // Check for Checkbox
                    if (currentBlock.querySelector && currentBlock.querySelector('input[type="checkbox"]')) {
                        e.preventDefault();

                        // Check if the line is empty (only has the checkbox)
                        // We need to be very careful about what "empty" means.
                        // It might contain &nbsp; (\u00A0) or normal spaces.
                        const textContent = currentBlock.textContent;
                        // Replace non-breaking spaces with normal spaces, then trim
                        const cleanText = textContent ? textContent.replace(/\u00A0/g, ' ').trim() : '';

                        // Also check if there are other elements besides the checkbox
                        // If there are other elements (like spans, bold tags etc), it's not empty
                        const hasOtherElements = Array.from(currentBlock.children).some(child =>
                            child.tagName !== 'INPUT' && child.tagName !== 'BR'
                        );

                        if (!hasOtherElements && cleanText === '') {
                            // Empty line with checkbox -> Convert to normal line (exit list)
                            // We simply remove the checkbox, leaving the div as a normal text block
                            const checkbox = currentBlock.querySelector('input[type="checkbox"]');
                            if (checkbox) {
                                checkbox.remove();
                            }

                            // Ensure the block isn't completely empty so it doesn't collapse
                            if (currentBlock.innerHTML.trim() === '') {
                                currentBlock.innerHTML = '<br>';
                            }

                            // Trigger state update since we modified DOM manually
                            if (textareaRef.current) {
                                const newContent = textareaRef.current.innerHTML;
                                setContent(newContent);
                                onUpdateNote({ ...note, title, content: newContent });
                            }
                        } else {
                            // Not empty -> Create new checkbox line
                            const checkboxHtml = '<div><input type="checkbox" style="margin-right: 5px;">&nbsp;</div>';
                            document.execCommand('insertHTML', false, checkboxHtml);
                        }
                        return;
                    }
                } else {
                    // Root level check for checkbox
                    if (startNode.nodeType === Node.TEXT_NODE) {
                        if (startNode.previousSibling && startNode.previousSibling.tagName === 'INPUT' && startNode.previousSibling.type === 'checkbox') {
                            e.preventDefault();
                            // Check if empty text node
                            if (!startNode.textContent || startNode.textContent.trim() === '') {
                                // Remove checkbox and make paragraph
                                startNode.previousSibling.remove();
                                startNode.remove();
                                document.execCommand('insertParagraph');
                            } else {
                                const checkboxHtml = '<div><input type="checkbox" style="margin-right: 5px;">&nbsp;</div>';
                                document.execCommand('insertHTML', false, checkboxHtml);
                            }
                            return;
                        }
                    }
                }
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

            // Check if we are in a text node and the char before cursor is '/'
            if (textNode.nodeType === Node.TEXT_NODE && range.startOffset > 0) {
                const text = textNode.textContent;
                if (text[range.startOffset - 1] === '/') {
                    setShowSlashMenu(true);

                    // Optional: Improve menu positioning
                    try {
                        const rect = range.getBoundingClientRect();
                        if (rect && rect.bottom !== 0) {
                            setSlashMenuPos({
                                top: `${rect.bottom + 5}px`,
                                left: `${rect.left}px`
                            });
                        }
                    } catch (err) {
                        // Fallback position if getBoundingClientRect fails
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

            // Restore selection/focus to editor
            if (textareaRef.current) {
                textareaRef.current.focus();
            }

            if (file.type.startsWith('image/')) {
                const imgHtml = `<img src="${result}" alt="${file.name}" style="max-width: 100%; border-radius: 4px; margin: 10px 0;" /><br>`;
                document.execCommand('insertHTML', false, imgHtml);
            } else {
                // Added contentEditable="false" to make it behave more like a button/attachment
                const fileHtml = `<a href="${result}" download="${file.name}" contentEditable="false" style="display: inline-flex; align-items: center; padding: 5px 10px; background: #f5f5f5; border-radius: 4px; text-decoration: none; color: #333; margin: 5px 0; cursor: pointer;">📎 ${file.name}</a>&nbsp;`;
                document.execCommand('insertHTML', false, fileHtml);
            }
        };
        reader.readAsDataURL(file);

        // Reset input so same file can be selected again if needed
        e.target.value = '';
    };

    const handleSlashSelect = (type) => {
        // 1. Remove the slash '/' character using CURRENT selection
        // Since we prevented default on mousedown in SlashMenu, focus should still be in editor
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const textNode = range.startContainer;

            // We expect the cursor to be right after the '/'
            if (textNode.nodeType === Node.TEXT_NODE && range.startOffset > 0) {
                const text = textNode.textContent;
                // Double check if the char before cursor is indeed '/'
                if (text[range.startOffset - 1] === '/') {
                    try {
                        // Create a range for the slash
                        const deleteRange = document.createRange();
                        deleteRange.setStart(textNode, range.startOffset - 1);
                        deleteRange.setEnd(textNode, range.startOffset);

                        // Select and delete it
                        selection.removeAllRanges();
                        selection.addRange(deleteRange);
                        deleteRange.deleteContents(); // Use DOM method directly

                        // Collapse selection to the point where slash was removed
                        selection.collapse(textNode, range.startOffset - 1);
                    } catch (e) {
                        console.error("Error deleting slash:", e);
                    }
                }
            }
        }

        // 2. Apply the formatting command
        // Ensure focus is definitely back in editor
        if (textareaRef.current) {
            textareaRef.current.focus();
        }

        switch (type) {
            case 'h1':
                document.execCommand('formatBlock', false, 'H1');
                break;
            case 'h2':
                document.execCommand('formatBlock', false, 'H2');
                break;
            case 'bullet':
                document.execCommand('insertUnorderedList');
                break;
            case 'number':
                document.execCommand('insertOrderedList');
                break;
            case 'todo':
                // Wrap in div to ensure block structure
                const checkboxHtml = '<div><input type="checkbox" style="margin-right: 5px;">&nbsp;</div>';
                document.execCommand('insertHTML', false, checkboxHtml);
                break;
            case 'image':
                if (fileInputRef.current) {
                    fileInputRef.current.accept = "image/*";
                    fileInputRef.current.click();
                }
                break;
            case 'file':
                if (fileInputRef.current) {
                    fileInputRef.current.accept = "*/*";
                    fileInputRef.current.click();
                }
                break;
            case 'separator':
                document.execCommand('insertHorizontalRule');
                document.execCommand('insertParagraph');
                break;
            case 'text':
                document.execCommand('formatBlock', false, 'P');
                break;
            default:
                break;
        }

        setShowSlashMenu(false);
    };

    if (!note) {
        return (
            <main className="note-view" id="noteView">
                <div className="note-content-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <p>Chọn một ghi chú để xem</p>
                </div>
            </main>
        );
    }

    return (
        <main className="note-view" id="noteView">
            <div className="note-header">
                <span id="saveStatus" className="save-status">Đã lưu</span>

                <div className="note-actions">
                    <div className="star-container">
                        <button
                            className={`star-btn ${note.isImportant ? 'active' : ''}`}
                            id="starBtn"
                            onClick={() => onUpdateNote({ ...note, isImportant: !note.isImportant })}
                        >
                            {note.isImportant ? '★' : '☆'}
                            <span className="tooltip">Đánh dấu quan trọng</span>
                        </button>
                    </div>
                    <div className="dropdown">
                        <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>⋮</button>
                        <div className="dropdown-content" style={{ display: showMenu ? 'block' : 'none' }}>
                            <button id="deleteBtn" onClick={() => { onDeleteNote(note.id); setShowMenu(false); }}>🗑️ Xóa ghi chú</button>
                            <button
                                id="addToCategoryBtn"
                                onClick={() => { setShowCategoryModal(true); setShowMenu(false); }}
                            >
                                🏷️ Thêm vào danh mục
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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

                <div
                    ref={textareaRef}
                    id="noteContent"
                    className="note-content"
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onInput={handleContentChange}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    style={{ outline: 'none', minHeight: '300px' }}
                ></div>
            </div>

            <CategorySelectionModal
                isOpen={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                categories={categories}
                onSelectCategory={(categoryId) => {
                    onAddNoteToCategory(note.id, categoryId);
                    setShowCategoryModal(false);
                }}
                onAddCategory={onAddCategory}
                onRenameCategory={onRenameCategory}
                onDeleteCategory={onDeleteCategory}
            />
        </main>
    );
};

export default NoteView;
