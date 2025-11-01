// ===================== Element references =====================
const addNoteBtn = document.getElementById("addNoteBtn");
const notesList = document.getElementById("notesList");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const starBtn = document.getElementById("starBtn");
const deleteBtn = document.getElementById("deleteBtn");
const saveStatus = document.getElementById("saveStatus");

// Menu buttons
const menuBtn = document.querySelector(".menu-btn");
const dropdown = document.querySelector(".dropdown-content");
const settingsBtn = document.querySelector(".settings-btn");
const settingsMenu = document.querySelector(".settings-menu");

// ===================== Notes logic =====================
const API_URL = "http://localhost:8080";
let notes = [];
let currentIndex = null;
let saveTimeout = null;

// --- Render danh sách notes ---
async function renderNotes() {
  const userId = 1; // Hardcoded user ID for now
  try {
    const response = await fetch(`${API_URL}/notes/user/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch notes');
    }
    notes = await response.json();
    notesList.innerHTML = "";
    notes.forEach((note, index) => {
      const li = document.createElement("li");
      li.textContent = note.title || "Untitled";
      if (note.is_important) li.classList.add("important");
      li.addEventListener("click", () => openNote(index));
      notesList.appendChild(li);
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
  }
}

// --- Mở note ---
function openNote(index) {
  currentIndex = index;
  const note = notes[index];
  noteTitle.value = note.title;
  noteContent.value = note.content;
  starBtn.classList.toggle("active", note.is_important);
  updateSaveStatus("saved");
}

// --- Tạo note ---
async function createNote() {
  const newNote = { title: "Untitled", content: "", is_important: false, userId: 1 };
  try {
    const response = await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newNote),
    });
    if (!response.ok) {
      throw new Error('Failed to create note');
    }
    await renderNotes();
    const newNoteIndex = notes.length - 1;
    openNote(newNoteIndex);
    noteTitle.focus();
  } catch (error) {
    console.error('Error creating note:', error);
  }
}

// --- Auto save (hiện "Saving..." → "Saved") ---
function autoSave() {
  if (currentIndex === null) return;
  const note = notes[currentIndex];
  note.title = noteTitle.value;
  note.content = noteContent.value;

  updateSaveStatus("saving");

  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      const response = await fetch(`${API_URL}/notes/${note.note_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
      });
      if (!response.ok) {
        throw new Error('Failed to save note');
      }
      await renderNotes();
      updateSaveStatus("saved");
    } catch (error) {
      console.error('Error saving note:', error);
      updateSaveStatus("error");
    }
  }, 800);
}

// --- Delete note ---
async function deleteNote() {
  if (currentIndex === null) return alert("Không có note nào được chọn!");
  if (!confirm("Bạn có chắc muốn xóa ghi chú này không?")) return;

  const note = notes[currentIndex];

  try {
    const response = await fetch(`${API_URL}/notes/${note.note_id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete note');
    }
    currentIndex = null;
    noteTitle.value = "";
    noteContent.value = "";
    updateSaveStatus("saved");
    await renderNotes();
  } catch (error) {
    console.error('Error deleting note:', error);
  }
}

// --- Mark important ---
async function toggleImportant() {
  if (currentIndex === null) return;
  const note = notes[currentIndex];
  note.is_important = !note.is_important;

  try {
    const response = await fetch(`${API_URL}/notes/${note.note_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(note),
    });
    if (!response.ok) {
      throw new Error('Failed to update note importance');
    }
    starBtn.classList.toggle("active", note.is_important);
    await renderNotes();
  } catch (error) {
    console.error('Error updating note importance:', error);
  }
}

// --- Cập nhật trạng thái lưu ---
function updateSaveStatus(state) {
  if (state === "saving") {
    saveStatus.textContent = "Saving...";
    saveStatus.className = "save-status saving";
  } else if (state === "saved") {
    saveStatus.textContent = "Saved";
    saveStatus.className = "save-status saved";
  } else if (state === "error") {
    saveStatus.textContent = "Error saving!";
    saveStatus.className = "save-status error";
  }
}

// ===================== MENU LOGIC =====================
// ⋮ menu
menuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.classList.toggle("show");
});

// ⚙️ settings
settingsBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  settingsMenu.classList.toggle("show");
});

// Click ra ngoài để đóng
window.addEventListener("click", (e) => {
  if (!e.target.matches(".menu-btn")) dropdown.classList.remove("show");
  if (!e.target.matches(".settings-btn")) settingsMenu.classList.remove("show");
});

// ===================== Event listeners =====================
addNoteBtn.addEventListener("click", createNote);
noteTitle.addEventListener("input", autoSave);
noteContent.addEventListener("input", autoSave);
starBtn.addEventListener("click", toggleImportant);
deleteBtn.addEventListener("click", deleteNote);

document.addEventListener('DOMContentLoaded', () => {
  renderNotes();
});
