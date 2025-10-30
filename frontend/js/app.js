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
let notes = JSON.parse(localStorage.getItem("notes") || "[]");
let currentIndex = null;
let saveTimeout = null;

// --- Render danh sách notes ---
function renderNotes() {
  notesList.innerHTML = "";
  notes.forEach((note, index) => {
    const li = document.createElement("li");
    li.textContent = note.title || "Untitled";
    if (note.important) li.classList.add("important");
    li.addEventListener("click", () => openNote(index));
    notesList.appendChild(li);
  });
}

// --- Mở note ---
function openNote(index) {
  currentIndex = index;
  const note = notes[index];
  noteTitle.value = note.title;
  noteContent.value = note.content;
  starBtn.classList.toggle("active", note.important);
  updateSaveStatus("saved");
}

// --- Tạo note ---
function createNote() {
  const newNote = { title: "", content: "", important: false };
  notes.push(newNote);
  currentIndex = notes.length - 1;
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes();
  openNote(currentIndex);
  noteTitle.focus();
}

// --- Auto save (hiện "Saving..." → "Saved") ---
function autoSave() {
  if (currentIndex === null) createNote();
  const note = notes[currentIndex];
  note.title = noteTitle.value;
  note.content = noteContent.value;

  updateSaveStatus("saving");

  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
    renderNotes();
    updateSaveStatus("saved");
  }, 800);
}

// --- Delete note ---
function deleteNote() {
  if (currentIndex === null) return alert("Không có note nào được chọn!");
  if (!confirm("Bạn có chắc muốn xóa ghi chú này không?")) return;

  notes.splice(currentIndex, 1);
  localStorage.setItem("notes", JSON.stringify(notes));
  currentIndex = null;

  noteTitle.value = "";
  noteContent.value = "";
  updateSaveStatus("saved");
  renderNotes();
}

// --- Mark important ---
function toggleImportant() {
  if (currentIndex === null) return;
  const note = notes[currentIndex];
  note.important = !note.important;
  localStorage.setItem("notes", JSON.stringify(notes));
  starBtn.classList.toggle("active", note.important);
  renderNotes();
}

// --- Cập nhật trạng thái lưu ---
function updateSaveStatus(state) {
  if (state === "saving") {
    saveStatus.textContent = "Saving...";
    saveStatus.className = "save-status saving";
  } else {
    saveStatus.textContent = "Saved";
    saveStatus.className = "save-status saved";
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

// ===================== Init =====================
renderNotes();
