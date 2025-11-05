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

// ===================== Notes logic =====================
let notes = [];
let currentNoteId = null;
let saveTimeout = null;
let isLoading = false;

// --- Init: Load notes from database ---
async function init() {
    try {
        updateSaveStatus("loading");
        notes = await window.NotesAPI.getNotes();
        renderNotes();
        renderImportantNotes();
        updateSaveStatus("saved");
    } catch (error) {
        console.error("Lỗi tải ghi chú:", error);
        alert("Không thể tải danh sách ghi chú. Vui lòng thử lại!");
        updateSaveStatus("error");
    }
}

// --- Render danh sách notes ---
function renderNotes() {
    notesList.innerHTML = "";
    notes.forEach((note) => {
        const li = document.createElement("li");
        li.textContent = note.title || "Untitled";
        li.dataset.noteId = note.note_id;
        if (currentNoteId === note.note_id) li.classList.add("active");
        li.addEventListener("click", () => openNote(note.note_id));
        notesList.appendChild(li);
    });
}

// --- Render Important notes ---
function renderImportantNotes() {
    importantList.innerHTML = "";
    const importantNotes = notes.filter(n => n.is_important);

    if (importantNotes.length === 0) {
        importantList.innerHTML = "<li style='color: #999'>Chưa có ghi chú quan trọng</li>";
        return;
    }

    importantNotes.forEach((note) => {
        const li = document.createElement("li");
        li.textContent = note.title || "Untitled";
        li.dataset.noteId = note.note_id;
        li.addEventListener("click", () => openNote(note.note_id));
        importantList.appendChild(li);
    });
}

// --- Mở note ---
async function openNote(noteId) {
    try {
        const note = await window.NotesAPI.getNoteById(noteId);
        currentNoteId = noteId;
        noteTitle.value = note.title || "";
        noteContent.value = note.content || "";
        starBtn.classList.toggle("active", note.is_important);

        // Highlight active note
        document.querySelectorAll("#notesList li").forEach(li => {
            li.classList.toggle("active", parseInt(li.dataset.noteId) === noteId);
        });

        updateSaveStatus("saved");
    } catch (error) {
        console.error("Lỗi mở ghi chú:", error);
        alert("Không thể mở ghi chú này!");
    }
}

// --- Tạo note mới ---
async function createNote() {
    try {
        updateSaveStatus("saving");
        const newNote = await window.NotesAPI.createNote({
            title: "Untitled",
            content: "",
            important: false
        });

        notes.push(newNote);
        currentNoteId = newNote.note_id;
        renderNotes();
        openNote(newNote.note_id);
        noteTitle.focus();
        updateSaveStatus("saved");
    } catch (error) {
        console.error("Lỗi tạo ghi chú:", error);
        alert("Không thể tạo ghi chú mới!");
        updateSaveStatus("error");
    }
}

// --- Auto save ---
function autoSave() {
    if (!currentNoteId) return;

    updateSaveStatus("saving");

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        try {
            const updatedNote = await window.NotesAPI.updateNote(currentNoteId, {
                title: noteTitle.value || "Untitled",
                content: noteContent.value || "",
                is_important: starBtn.classList.contains("active")
            });

            // Cập nhật local notes array
            const index = notes.findIndex(n => n.note_id === currentNoteId);
            if (index !== -1) {
                notes[index] = updatedNote;
            }

            renderNotes();
            renderImportantNotes();
            updateSaveStatus("saved");
        } catch (error) {
            console.error("Lỗi lưu ghi chú:", error);
            updateSaveStatus("error");
        }
    }, 1000);
}

// --- Delete note ---
async function deleteNote() {
    if (!currentNoteId) return alert("Không có ghi chú nào được chọn!");
    if (!confirm("Bạn có chắc muốn xóa ghi chú này không?")) return;

    try {
        updateSaveStatus("deleting");
        await window.NotesAPI.deleteNote(currentNoteId);

        notes = notes.filter(n => n.note_id !== currentNoteId);
        currentNoteId = null;

        noteTitle.value = "";
        noteContent.value = "";

        renderNotes();
        renderImportantNotes();
        updateSaveStatus("saved");
    } catch (error) {
        console.error("Lỗi xóa ghi chú:", error);
        alert("Không thể xóa ghi chú!");
        updateSaveStatus("error");
    }
}

// --- Mark important ---
async function toggleImportant() {
    if (!currentNoteId) return;

    try {
        const isImportant = !starBtn.classList.contains("active");
        starBtn.classList.toggle("active", isImportant);

        updateSaveStatus("saving");
        const updatedNote = await window.NotesAPI.updateNote(currentNoteId, {
            title: noteTitle.value,
            content: noteContent.value,
            is_important: isImportant
        });

        // Cập nhật local
        const index = notes.findIndex(n => n.note_id === currentNoteId);
        if (index !== -1) {
            notes[index] = updatedNote;
        }

        renderNotes();
        renderImportantNotes();
        updateSaveStatus("saved");
    } catch (error) {
        console.error("Lỗi đánh dấu quan trọng:", error);
        starBtn.classList.toggle("active"); // Revert
        updateSaveStatus("error");
    }
}

// --- Search notes ---
async function handleSearch(keyword) {
    if (!keyword.trim()) {
        renderNotes();
        return;
    }

    try {
        const results = await window.NotesAPI.searchNotes(keyword);
        notes = results;
        renderNotes();
    } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
    }
}

// Debounce search
let searchTimeout;
searchBox.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        handleSearch(e.target.value);
    }, 500);
});

// --- Cập nhật trạng thái lưu ---
function updateSaveStatus(state) {
    const states = {
        loading: { text: "Đang tải...", class: "loading", color: "#999" },
        saving: { text: "Đang lưu...", class: "saving", color: "#c49b00" },
        saved: { text: "Đã lưu", class: "saved", color: "#4caf50" },
        error: { text: "Lỗi lưu", class: "error", color: "#f44336" },
        deleting: { text: "Đang xóa...", class: "deleting", color: "#ff9800" }
    };

    const status = states[state] || states.saved;
    saveStatus.textContent = status.text;
    saveStatus.className = `save-status ${status.class}`;
    saveStatus.style.color = status.color;
}

// ===================== MENU LOGIC =====================
menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
});

settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    settingsMenu.classList.toggle("show");
});

window.addEventListener("click", (e) => {
    if (!e.target.matches(".menu-btn")) dropdown.classList.remove("show");
    if (!e.target.matches(".settings-btn")) settingsMenu.classList.remove("show");
});

// === Tự động tạo ghi chú mới khi người dùng tương tác với vùng trống ===

// Lấy phần hiển thị note chính (khu vực để gõ nội dung)
const noteView = document.getElementById("noteView");
let isCreating = false; // tránh tạo trùng note khi click nhanh liên tục

// Khi click vào vùng trắng, nếu chưa có note nào đang mở -> tạo mới
noteView.addEventListener("click", async (e) => {
  // Kiểm tra nếu click vào chính vùng note (không phải sidebar, không phải nút)
  const isInsideEditor = e.target === noteView || noteView.contains(e.target);

  if (isInsideEditor && !currentNoteId && !isCreating) {
    isCreating = true;
    await createNote();
    isCreating = false;
  }
});

// Khi người dùng bắt đầu gõ (hoặc focus vào input) mà chưa có note -> tự tạo note
[noteTitle, noteContent].forEach((el) => {
  el.addEventListener("focus", async () => {
    if (!currentNoteId && !isCreating) {
      isCreating = true;
      await createNote();
      isCreating = false;
    }
  });
});


// ===================== Event listeners =====================
addNoteBtn.addEventListener("click", createNote);
noteTitle.addEventListener("input", autoSave);
noteContent.addEventListener("input", autoSave);
starBtn.addEventListener("click", toggleImportant);
deleteBtn.addEventListener("click", deleteNote);

// ===================== Init app =====================
document.addEventListener("DOMContentLoaded", init);