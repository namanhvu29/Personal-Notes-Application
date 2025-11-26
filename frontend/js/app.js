// ===================== Element references =====================
const addNoteBtn = document.getElementById("addNoteBtn");
const notesList = document.getElementById("notesList");
const importantList = document.getElementById("importantList");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const starBtn = document.getElementById("starBtn");
const deleteBtn = document.getElementById("deleteBtn");
const saveStatus = document.getElementById("saveStatus");
const searchBox = document.querySelector(".search-box");

// Menu buttons
const menuBtn = document.querySelector(".menu-btn");
const dropdown = document.querySelector(".dropdown-content");
const settingsBtn = document.querySelector(".settings-btn");
const settingsMenu = document.querySelector(".settings-menu");

// ===================== Config =====================
const API_URL = "http://localhost:8080/foundation";

// ===================== Helper Functions =====================
function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

function getCurrentUserId() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return currentUser ? currentUser.user_id : null;
}

// ===================== Notes logic =====================
let notes = [];
let importantNotes = [];
let currentNote = null;
let saveTimeout = null;

// --- Fetch all notes ---
async function fetchNotes() {
    const userId = getCurrentUserId();
    if (!userId) {
        console.error('❌ User not logged in');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/notes/user/${userId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch notes');
        }

        notes = await response.json();
        renderNotes();
        renderImportantNotes();
    } catch (error) {
        console.error('❌ Error fetching notes:', error);
        updateSaveStatus("error");
    }
}

// --- Render notes list ---
function renderNotes() {
    notesList.innerHTML = "";

    if (notes.length === 0) {
        notesList.innerHTML = "<li style='color: #999; font-style: italic;'>No notes yet</li>";
        return;
    }

    notes.forEach((note) => {
        const li = document.createElement("li");
        li.textContent = note.title || "Untitled";
        li.dataset.noteId = note.note_id;

        if (currentNote && currentNote.note_id === note.note_id) {
            li.classList.add("active");
        }

        li.addEventListener("click", () => openNote(note));
        notesList.appendChild(li);
    });
}

// --- Render important notes ---
function renderImportantNotes() {
    importantList.innerHTML = "";
    importantNotes = notes.filter(note => note.is_important);

    if (importantNotes.length === 0) {
        importantList.innerHTML = "<li style='color: #999; font-style: italic;'>No important notes</li>";
        return;
    }

    importantNotes.forEach((note) => {
        const li = document.createElement("li");
        li.textContent = note.title || "Untitled";
        li.dataset.noteId = note.note_id;
        li.addEventListener("click", () => openNote(note));
        importantList.appendChild(li);
    });
}

// --- Open note ---
function openNote(note) {
    currentNote = note;
    noteTitle.value = note.title || "";
    noteContent.value = note.content || "";
    starBtn.classList.toggle("active", note.is_important);

    // Update active state
    document.querySelectorAll("#notesList li").forEach(li => {
        li.classList.toggle("active", li.dataset.noteId == note.note_id);
    });

    updateSaveStatus("saved");
}

// --- Create new note ---
async function createNote() {
    const userId = getCurrentUserId();
    if (!userId) return;

    updateSaveStatus("saving");

    try {
        const response = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                user_id: userId,
                title: "Untitled",
                content: "",
                is_important: false
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create note');
        }

        const newNote = await response.json();
        notes.push(newNote);
        renderNotes();
        openNote(newNote);
        noteTitle.focus();
        updateSaveStatus("saved");
    } catch (error) {
        console.error('❌ Error creating note:', error);
        updateSaveStatus("error");
    }
}

// --- Auto save ---
function autoSave() {
    if (!currentNote) return;

    updateSaveStatus("saving");

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`${API_URL}/notes/${currentNote.note_id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    title: noteTitle.value || "Untitled",
                    content: noteContent.value || "",
                    is_important: currentNote.is_important
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save note');
            }

            const updatedNote = await response.json();

            // Update local data
            const index = notes.findIndex(n => n.note_id === currentNote.note_id);
            if (index !== -1) {
                notes[index] = updatedNote;
            }
            currentNote = updatedNote;

            renderNotes();
            renderImportantNotes();
            updateSaveStatus("saved");
        } catch (error) {
            console.error('❌ Error saving note:', error);
            updateSaveStatus("error");
        }
    }, 800);
}

// --- Toggle important ---
async function toggleImportant() {
    if (!currentNote) return;

    updateSaveStatus("saving");

    try {
        const response = await fetch(`${API_URL}/notes/${currentNote.note_id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                title: currentNote.title,
                content: currentNote.content,
                is_important: !currentNote.is_important
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update note');
        }

        const updatedNote = await response.json();
        currentNote = updatedNote;

        // Update local data
        const index = notes.findIndex(n => n.note_id === currentNote.note_id);
        if (index !== -1) {
            notes[index] = updatedNote;
        }

        starBtn.classList.toggle("active", updatedNote.is_important);
        renderNotes();
        renderImportantNotes();
        updateSaveStatus("saved");
    } catch (error) {
        console.error('❌ Error updating note:', error);
        updateSaveStatus("error");
    }
}

// --- Delete note ---
async function deleteNote() {
    if (!currentNote) {
        alert("Vui lòng chọn một ghi chú để xóa!");
        return;
    }

    if (!confirm("Bạn có chắc muốn xóa ghi chú này không?")) return;

    updateSaveStatus("deleting");

    try {
        const response = await fetch(`${API_URL}/notes/${currentNote.note_id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to delete note');
        }

        // Remove from local data
        notes = notes.filter(n => n.note_id !== currentNote.note_id);

        // Clear editor
        currentNote = null;
        noteTitle.value = "";
        noteContent.value = "";
        starBtn.classList.remove("active");

        renderNotes();
        renderImportantNotes();
        updateSaveStatus("saved");

        // Close dropdown
        dropdown.classList.remove("show");
    } catch (error) {
        console.error('❌ Error deleting note:', error);
        updateSaveStatus("error");
    }
}

// --- Search notes ---
function searchNotes() {
    const keyword = searchBox.value.trim().toLowerCase();

    if (!keyword) {
        renderNotes();
        return;
    }

    notesList.innerHTML = "";
    const filteredNotes = notes.filter(note =>
        (note.title && note.title.toLowerCase().includes(keyword)) ||
        (note.content && note.content.toLowerCase().includes(keyword))
    );

    if (filteredNotes.length === 0) {
        notesList.innerHTML = "<li style='color: #999; font-style: italic;'>No results</li>";
        return;
    }

    filteredNotes.forEach((note) => {
        const li = document.createElement("li");
        li.textContent = note.title || "Untitled";
        li.dataset.noteId = note.note_id;

        if (currentNote && currentNote.note_id === note.note_id) {
            li.classList.add("active");
        }

        li.addEventListener("click", () => openNote(note));
        notesList.appendChild(li);
    });
}

// --- Update save status ---
function updateSaveStatus(state) {
    const statusMap = {
        saving: { text: "Saving...", className: "save-status saving" },
        saved: { text: "Saved", className: "save-status saved" },
        error: { text: "Error!", className: "save-status error" },
        deleting: { text: "Deleting...", className: "save-status deleting" }
    };

    const status = statusMap[state] || statusMap.saved;
    saveStatus.textContent = status.text;
    saveStatus.className = status.className;
}

// ===================== MENU LOGIC =====================
menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
    settingsMenu.classList.remove("show");
});

settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    settingsMenu.classList.toggle("show");
    dropdown.classList.remove("show");
});

window.addEventListener("click", () => {
    dropdown.classList.remove("show");
    settingsMenu.classList.remove("show");
});

// ===================== Event listeners =====================
addNoteBtn.addEventListener("click", createNote);
noteTitle.addEventListener("input", autoSave);
noteContent.addEventListener("input", autoSave);
starBtn.addEventListener("click", toggleImportant);
deleteBtn.addEventListener("click", deleteNote);
searchBox.addEventListener("input", searchNotes);

// Settings menu - Logout
const logoutBtnInMenu = settingsMenu.querySelector('button:last-child');
if (logoutBtnInMenu) {
    logoutBtnInMenu.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('accessToken');
        window.location.href = 'login.html';
    });
}

// ===================== Init =====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== APP.JS LOADED ===');

    // Check login
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    console.log('✅ User logged in:', currentUser.username);
    fetchNotes();
});