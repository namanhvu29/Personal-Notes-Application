// frontend/js/notes-api.js
const API_BASE_URL = 'http://localhost:8080/foundation';

// Helper function để lấy user hiện tại
function getCurrentUserId() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser ? currentUser.user_id : null;
}

// ============ NOTES API ============

// Tạo note mới
async function createNoteAPI(noteData) {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Chưa đăng nhập!');

    const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: userId,
            title: noteData.title || 'Untitled',
            content: noteData.content || '',
            is_important: noteData.important || false
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    return await response.json();
}

// Lấy tất cả notes của user
async function getNotesAPI() {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Chưa đăng nhập!');

    const response = await fetch(`${API_BASE_URL}/notes/user/${userId}`);

    if (!response.ok) {
        throw new Error('Không thể tải danh sách ghi chú');
    }

    return await response.json();
}

// Lấy notes quan trọng
async function getImportantNotesAPI() {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Chưa đăng nhập!');

    const response = await fetch(`${API_BASE_URL}/notes/user/${userId}/important`);

    if (!response.ok) {
        throw new Error('Không thể tải ghi chú quan trọng');
    }

    return await response.json();
}

// Lấy chi tiết 1 note
async function getNoteByIdAPI(noteId) {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`);

    if (!response.ok) {
        throw new Error('Không tìm thấy ghi chú');
    }

    return await response.json();
}

// Cập nhật note
async function updateNoteAPI(noteId, noteData) {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: noteData.title,
            content: noteData.content,
            is_important: noteData.is_important
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    return await response.json();
}

// Xóa note
async function deleteNoteAPI(noteId) {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    return await response.text();
}

// Tìm kiếm notes
async function searchNotesAPI(keyword) {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Chưa đăng nhập!');

    const response = await fetch(`${API_BASE_URL}/notes/user/${userId}/search?keyword=${encodeURIComponent(keyword)}`);

    if (!response.ok) {
        throw new Error('Lỗi tìm kiếm');
    }

    return await response.json();
}

// Export functions để sử dụng ở file khác
window.NotesAPI = {
    createNote: createNoteAPI,
    getNotes: getNotesAPI,
    getImportantNotes: getImportantNotesAPI,
    getNoteById: getNoteByIdAPI,
    updateNote: updateNoteAPI,
    deleteNote: deleteNoteAPI,
    searchNotes: searchNotesAPI
};