
let currentTextColor = '#000000';
let currentHighlight = '#FFFF00';

// Hàm định dạng văn bản cơ bản
function formatText(command) {
    const noteContent = document.getElementById('noteContent');
    
    if (!noteContent) return;
    
    // Kiểm tra xem noteContent có phải textarea không
    if (noteContent.tagName === 'TEXTAREA') {
        convertToContentEditable();
    }
    
    document.execCommand(command, false, null);
    noteContent.focus();
}

// Hàm áp dụng heading
function applyHeading(tag) {
    const noteContent = document.getElementById('noteContent');
    
    if (!noteContent) return;
    
    if (noteContent.tagName === 'TEXTAREA') {
        convertToContentEditable();
    }
    
    document.execCommand('formatBlock', false, tag);
    document.getElementById('headingMenu').classList.remove('show');
    noteContent.focus();
}

// Hàm đổi màu chữ
function changeTextColor(color) {
    const noteContent = document.getElementById('noteContent');
    
    if (!noteContent) return;
    
    if (noteContent.tagName === 'TEXTAREA') {
        convertToContentEditable();
    }
    
    currentTextColor = color;
    document.execCommand('foreColor', false, color);
    
    const textColorBtn = document.getElementById('textColorBtn');
    if (textColorBtn) {
        textColorBtn.querySelector('span').style.textDecorationColor = color;
    }
    
    noteContent.focus();
}

// Hàm highlight text
function highlightText(color) {
    const noteContent = document.getElementById('noteContent');
    
    if (!noteContent) return;
    
    if (noteContent.tagName === 'TEXTAREA') {
        convertToContentEditable();
    }
    
    if (color === 'none') {
        document.execCommand('hiliteColor', false, 'transparent');
    } else {
        currentHighlight = color;
        document.execCommand('hiliteColor', false, color);
        
        const highlightBtn = document.getElementById('highlightBtn');
        if (highlightBtn) {
            highlightBtn.querySelector('span').style.background = color;
        }
    }
    
    noteContent.focus();
}

// Hàm chèn link
function insertLink() {
    const noteContent = document.getElementById('noteContent');
    
    if (!noteContent) return;
    
    if (noteContent.tagName === 'TEXTAREA') {
        convertToContentEditable();
    }
    
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    const linkTextInput = document.getElementById('linkText');
    const linkUrlInput = document.getElementById('linkUrl');
    const linkModal = document.getElementById('linkModal');
    
    if (linkTextInput) linkTextInput.value = selectedText || '';
    if (linkUrlInput) linkUrlInput.value = '';
    if (linkModal) linkModal.classList.add('show');
}

function confirmLink() {
    const linkText = document.getElementById('linkText').value;
    const linkUrl = document.getElementById('linkUrl').value;
    
    if (linkUrl) {
        const selection = window.getSelection();
        if (selection.toString()) {
            document.execCommand('createLink', false, linkUrl);
        } else if (linkText) {
            document.execCommand('insertHTML', false, `<a href="${linkUrl}" target="_blank">${linkText}</a>`);
        }
    }
    
    closeLinkModal();
}

function closeLinkModal() {
    const linkModal = document.getElementById('linkModal');
    if (linkModal) {
        linkModal.classList.remove('show');
    }
    
    const noteContent = document.getElementById('noteContent');
    if (noteContent) {
        noteContent.focus();
    }
}

// Hàm xóa định dạng
function clearFormatting() {
    const noteContent = document.getElementById('noteContent');
    
    if (!noteContent) return;
    
    if (noteContent.tagName === 'TEXTAREA') {
        return;
    }
    
    document.execCommand('removeFormat', false, null);
    noteContent.focus();
}

// Hàm chuyển đổi từ textarea sang contenteditable div
function convertToContentEditable() {
    const textarea = document.getElementById('noteContent');
    if (!textarea) return;
    
    const wrapper = textarea.parentElement;
    
    // Tạo div contenteditable mới
    const editableDiv = document.createElement('div');
    editableDiv.id = 'noteContent';
    editableDiv.className = 'note-content';
    editableDiv.contentEditable = 'true';
    editableDiv.innerHTML = textarea.value.replace(/\n/g, '<br>');
    
    // Thay thế textarea bằng div
    wrapper.replaceChild(editableDiv, textarea);
    
    // Thêm event listener cho div mới
    editableDiv.addEventListener('input', function() {
        // Trigger save nếu có hàm saveCurrentNote
        if (typeof saveCurrentNote === 'function') {
            saveCurrentNote();
        }
    });
    
    editableDiv.focus();
}

// Khởi tạo khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
    const headingBtn = document.getElementById('headingBtn');
    const headingMenu = document.getElementById('headingMenu');
    const textColorBtn = document.getElementById('textColorBtn');
    const textColorMenu = document.getElementById('textColorMenu');
    const highlightBtn = document.getElementById('highlightBtn');
    const highlightMenu = document.getElementById('highlightMenu');
    
    // Toggle menu heading
    if (headingBtn && headingMenu) {
        headingBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            headingMenu.classList.toggle('show');
            if (textColorMenu) textColorMenu.classList.remove('show');
            if (highlightMenu) highlightMenu.classList.remove('show');
        });
    }
    
    // Toggle menu màu chữ
    if (textColorBtn && textColorMenu) {
        textColorBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            textColorMenu.classList.toggle('show');
            if (headingMenu) headingMenu.classList.remove('show');
            if (highlightMenu) highlightMenu.classList.remove('show');
        });
    }
    
    // Chọn màu chữ
    if (textColorMenu) {
        const colorOptions = textColorMenu.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                const color = this.getAttribute('data-color');
                changeTextColor(color);
                textColorMenu.classList.remove('show');
            });
        });
    }
    
    // Toggle menu highlight
    if (highlightBtn && highlightMenu) {
        highlightBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            highlightMenu.classList.toggle('show');
            if (headingMenu) headingMenu.classList.remove('show');
            if (textColorMenu) textColorMenu.classList.remove('show');
        });
    }
    
    // Chọn màu highlight
    if (highlightMenu) {
        const highlightOptions = highlightMenu.querySelectorAll('.highlight-option');
        highlightOptions.forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                if (this.classList.contains('remove-highlight')) {
                    highlightText('none');
                } else {
                    const color = this.getAttribute('data-color');
                    highlightText(color);
                }
                highlightMenu.classList.remove('show');
            });
        });
    }
    
    // Đóng menu khi click ra ngoài
    document.addEventListener('click', function() {
        if (headingMenu) headingMenu.classList.remove('show');
        if (textColorMenu) textColorMenu.classList.remove('show');
        if (highlightMenu) highlightMenu.classList.remove('show');
    });
    
    // Hiển thị toolbar khi focus vào note content
    const noteContent = document.getElementById('noteContent');
    const toolbar = document.getElementById('formattingToolbar');
    
    if (noteContent && toolbar) {
        noteContent.addEventListener('focus', function() {
            toolbar.classList.add('show');
        });
    }
});

// Hỗ trợ phím tắt
document.addEventListener('keydown', function(e) {
    const noteContent = document.getElementById('noteContent');
    
    if (!noteContent || document.activeElement !== noteContent) return;
    
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 'b':
                e.preventDefault();
                formatText('bold');
                break;
            case 'i':
                e.preventDefault();
                formatText('italic');
                break;
            case 'u':
                e.preventDefault();
                formatText('underline');
                break;
            case 'k':
                e.preventDefault();
                insertLink();
                break;
        }
    }
});