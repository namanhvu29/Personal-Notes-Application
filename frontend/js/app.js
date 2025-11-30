// Khởi tạo ứng dụng
(function() {
    "use strict";

    // =================================================================
    // 1. THAM CHIẾU ELEMENTS
    // =================================================================
    const $ = selector => document.getElementById(selector);

    const elements = {
        addNoteBtn: $("addNoteBtn"),
        addCategoryBtn: $("addCategoryBtn"),
        searchBox: $("searchBox"),
        searchResultsContainer: $("searchResultsContainer"),
        searchResultsList: $("searchResultsList"),
        searchWrapper: $("searchWrapper"),
        notesList: $("notesList"),
        categoryList: $("categoryList"),
        importantList: $("importantList"),
        noteTitle: $("noteTitle"),
        noteContent: $("noteContent"),
        starBtn: $("starBtn"),
        deleteBtn: $("deleteBtn"),
        saveStatus: $("saveStatus"),
        categoryDropdown: $("categoryDropdown"),
        addToCategoryBtn: $("addToCategoryBtn"),
        openTrashBtn: $("openTrashBtn"),
        trashModal: $("trashModal"),
        closeModalBtn: $("closeModalBtn"),
        emptyTrashAllBtn: $("emptyTrashAllBtn"),
        trashList: $("trashList"),
        slashMenu: $("slashMenu"),
        slashList: $("slashList"),
    };

    // =================================================================
    // 2. STATE VÀ DỮ LIỆU
    // =================================================================
    let notes = []; // ✅ Lấy từ API
    let categories = JSON.parse(localStorage.getItem("categories") || "[]");
    let trash = JSON.parse(localStorage.getItem("trash") || "[]");
    let currentNote = null; // ✅ Lưu note object từ API
    let saveTimeout = null;
    let isDropdownOpen = false;

    // =================================================================
    // 3. UTILITY FUNCTIONS
    // =================================================================

    function updateSaveStatus(status) {
        elements.saveStatus.textContent = status === "saving" ? "Đang lưu..." : "Đã lưu";
        elements.saveStatus.classList.remove("saving", "saved");
        elements.saveStatus.classList.add(status);
        if (status === "saved") {
            setTimeout(() => { elements.saveStatus.textContent = ""; }, 2000);
        }
    }

    function persistData() {
        localStorage.setItem("categories", JSON.stringify(categories));
        localStorage.setItem("trash", JSON.stringify(trash));
    }

    // =================================================================
    // 4. NOTE LOGIC - API INTEGRATION
    // =================================================================

    /**
     * ✅ Tải notes từ Backend API
     */
    async function loadNotesFromAPI() {
        try {
            updateSaveStatus("saving");
            elements.notesList.innerHTML = "<li style='color:#999'>Đang tải...</li>";

            notes = await window.NotesAPI.getNotes();
            console.log('✅ Loaded notes:', notes.length);

            renderAll();
            updateSaveStatus("saved");

            if (notes.length > 0) {
                openNote(notes[0]);
            }
        } catch (error) {
            console.error('❌ Load notes error:', error);
            elements.notesList.innerHTML = "<li style='color:red'>Lỗi kết nối</li>";
            updateSaveStatus("saved");
        }
    }

    function openNote(note) {
        if (!note) return;

        currentNote = note;

        elements.noteTitle.value = note.title || '';
        elements.noteContent.value = note.content || '';

        elements.starBtn.classList.toggle("active", note.is_important);
        elements.starBtn.textContent = note.is_important ? "⭐" : "☆";

        document.querySelector('.dropdown-content').style.display = 'none';
        isDropdownOpen = false;

        updateSaveStatus("saved");
        renderNotes();
    }

    /**
     * ✅ Tạo note mới qua API
     */
    async function createNote() {
        try {
            updateSaveStatus("saving");

            const newNote = await window.NotesAPI.createNote({
                title: '',
                content: '',
                important: false
            });

            console.log('✅ Created note:', newNote.note_id);

            notes.unshift(newNote);

            renderAll();
            openNote(newNote);
            elements.noteTitle.focus();

            updateSaveStatus("saved");
        } catch (error) {
            console.error('❌ Create note error:', error);
            alert('Lỗi tạo ghi chú: ' + error.message);
            updateSaveStatus("saved");
        }
    }

    /**
     * ✅ Auto save qua API
     */
    function autoSave() {
        if (!currentNote) {
            return createNote();
        }

        const updatedTitle = elements.noteTitle.value;
        const updatedContent = elements.noteContent.value;

        updateSaveStatus("saving");
        clearTimeout(saveTimeout);

        saveTimeout = setTimeout(async () => {
            try {
                const updated = await window.NotesAPI.updateNote(currentNote.note_id, {
                    title: updatedTitle,
                    content: updatedContent,
                    is_important: currentNote.is_important
                });

                console.log('✅ Saved note:', updated.note_id);

                currentNote.title = updated.title;
                currentNote.content = updated.content;
                currentNote.updated_at = updated.updated_at;

                const index = notes.findIndex(n => n.note_id === currentNote.note_id);
                if (index !== -1) {
                    notes[index] = currentNote;
                }

                renderAll();
                updateSaveStatus("saved");
            } catch (error) {
                console.error('❌ Save error:', error);
                alert('Lỗi lưu: ' + error.message);
                updateSaveStatus("saved");
            }
        }, 800);
    }

    /**
     * ✅ Xóa note qua API
     */
    async function deleteNote() {
        if (!currentNote) {
            return alert("Chọn note trước!");
        }

        if (!confirm(`Xóa ghi chú "${currentNote.title || 'Untitled'}"?`)) return;

        try {
            updateSaveStatus("saving");

            await window.NotesAPI.deleteNote(currentNote.note_id);

            console.log('✅ Deleted note:', currentNote.note_id);

            notes = notes.filter(n => n.note_id !== currentNote.note_id);

            currentNote = null;
            elements.noteTitle.value = "";
            elements.noteContent.value = "";

            renderAll();

            if (notes.length > 0) {
                openNote(notes[0]);
            }

            updateSaveStatus("saved");
        } catch (error) {
            console.error('❌ Delete error:', error);
            alert('Lỗi xóa: ' + error.message);
            updateSaveStatus("saved");
        }
    }

    /**
     * ✅ Toggle important qua API
     */
    async function toggleImportant() {
        if (!currentNote) return alert("Chọn note trước!");

        try {
            updateSaveStatus("saving");

            const newStatus = !currentNote.is_important;

            const updated = await window.NotesAPI.updateNote(currentNote.note_id, {
                title: currentNote.title,
                content: currentNote.content,
                is_important: newStatus
            });

            console.log('✅ Updated important:', updated.note_id);

            currentNote.is_important = newStatus;
            elements.starBtn.classList.toggle("active", newStatus);
            elements.starBtn.textContent = newStatus ? "⭐" : "☆";

            const index = notes.findIndex(n => n.note_id === currentNote.note_id);
            if (index !== -1) {
                notes[index].is_important = newStatus;
            }

            renderAll();
            updateSaveStatus("saved");
        } catch (error) {
            console.error('❌ Toggle important error:', error);
            alert('Lỗi: ' + error.message);
            updateSaveStatus("saved");
        }
    }

    /**
     * ✅ Search qua API
     */
    async function searchNotes() {
        const query = elements.searchBox.value.toLowerCase().trim();

        elements.searchResultsList.innerHTML = "";
        elements.searchResultsContainer.classList.remove("show");

        if (!query) return;

        try {
            const results = await window.NotesAPI.searchNotes(query);

            console.log('🔍 Search results:', results.length);

            if (results.length === 0) {
                elements.searchResultsList.innerHTML = `<li style='color:#999'>Không tìm thấy.</li>`;
                elements.searchResultsContainer.classList.add("show");
                return;
            }

            results.forEach(note => {
                const li = document.createElement("li");
                li.textContent = note.title || "Untitled";

                li.addEventListener("click", (e) => {
                    e.stopPropagation();
                    openNote(note);
                    elements.searchBox.value = "";
                    elements.searchResultsContainer.classList.remove("show");
                });

                elements.searchResultsList.appendChild(li);
            });

            elements.searchResultsContainer.classList.add("show");
        } catch (error) {
            console.error('❌ Search error:', error);
            elements.searchResultsList.innerHTML = `<li style='color:red'>Lỗi tìm kiếm</li>`;
            elements.searchResultsContainer.classList.add("show");
        }
    }

    // =================================================================
    // 5. RENDER LOGIC
    // =================================================================

    function renderNotes() {
        elements.notesList.innerHTML = "";
        elements.searchResultsContainer.classList.remove("show");

        if (notes.length === 0) {
            elements.notesList.innerHTML = "<li style='color:#999'>Chưa có ghi chú</li>";
            return;
        }

        notes.forEach(note => {
            const li = document.createElement("li");
            li.textContent = note.title || "Untitled";
            if (note.is_important) li.classList.add("important");

            if (currentNote && note.note_id === currentNote.note_id) {
                li.classList.add("selected");
            }

            li.addEventListener("click", () => openNote(note));
            elements.notesList.appendChild(li);
        });
    }

    function renderImportantList() {
        elements.importantList.innerHTML = "";
        const importantNotes = notes.filter(n => n.is_important);

        if (importantNotes.length === 0) {
            elements.importantList.innerHTML = "<li style='color:#999'>Không có ghi chú quan trọng</li>";
            return;
        }

        importantNotes.forEach(note => {
            const li = document.createElement("li");
            li.textContent = note.title || "Untitled";
            li.addEventListener("click", () => openNote(note));
            elements.importantList.appendChild(li);
        });
    }

    function renderCategories() {
        elements.categoryList.innerHTML = "";
        elements.categoryDropdown.innerHTML = "";

        if (categories.length === 0) {
            elements.categoryList.innerHTML = "<li style='color:#999'>Chưa có danh mục</li>";
            elements.categoryDropdown.innerHTML = "<li>Không có danh mục</li>";
            return;
        }

        categories.forEach((cat, catIndex) => {
            const liSidebar = document.createElement("li");
            liSidebar.classList.add("category-item");

            const catHeader = document.createElement("div");
            catHeader.style.display = 'flex';
            catHeader.style.justifyContent = 'space-between';
            catHeader.style.alignItems = 'center';
            catHeader.style.cursor = 'pointer';

            const span = document.createElement("span");
            span.textContent = cat.name;
            span.classList.add("category-name");

            const delBtn = document.createElement("button");
            delBtn.textContent = "🗑️";
            delBtn.style.background = 'none';
            delBtn.style.border = 'none';
            delBtn.style.fontSize = '12px';
            delBtn.style.cursor = 'pointer';

            const notesUl = document.createElement("ul");
            notesUl.classList.add("category-notes");
            notesUl.style.display = "none";

            cat.notes.forEach(noteId => {
                const note = notes.find(n => n.note_id === noteId);
                if (!note) return;
                const noteLi = document.createElement("li");
                noteLi.textContent = note.title || "Untitled";
                noteLi.addEventListener("click", (e) => {
                    e.stopPropagation();
                    openNote(note);
                });
                notesUl.appendChild(noteLi);
            });

            span.addEventListener("click", () => {
                notesUl.style.display = notesUl.style.display === "none" ? "block" : "none";
            });

            delBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                handleDeleteCategory(cat.name, catIndex);
            });

            catHeader.appendChild(span);
            catHeader.appendChild(delBtn);
            liSidebar.appendChild(catHeader);
            liSidebar.appendChild(notesUl);
            elements.categoryList.appendChild(liSidebar);

            const liDropdown = document.createElement("li");
            const dropdownBtn = document.createElement("button");
            dropdownBtn.textContent = `Thêm vào ${cat.name}`;
            dropdownBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                addNoteToCategory(cat.name);
            });
            liDropdown.appendChild(dropdownBtn);
            elements.categoryDropdown.appendChild(liDropdown);
        });
    }

    function renderTrash() {
        elements.trashList.innerHTML = "";

        if (trash.length === 0) {
            elements.trashList.innerHTML = "<li style='color:#999'>Thùng rác trống</li>";
            return;
        }

        trash.forEach((item, index) => {
            const li = document.createElement("li");
            li.classList.add('trash-item');

            const name = item.data.title || item.data.name || "Mục không tên";

            const itemContainer = document.createElement("div");
            itemContainer.classList.add('trash-item-container');
            itemContainer.innerHTML = `<span>[${item.type.charAt(0).toUpperCase()}] ${name}</span>`;

            const actions = document.createElement("div");
            actions.classList.add('trash-item-actions');

            const restoreBtn = document.createElement("button");
            restoreBtn.textContent = "↩️ Phục hồi";
            restoreBtn.classList.add('restore-btn');
            restoreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                restoreItem(index);
            });

            const deletePermBtn = document.createElement("button");
            deletePermBtn.textContent = "❌ Xóa";
            deletePermBtn.classList.add('delete-perm-btn');
            deletePermBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Xóa vĩnh viễn "${name}"?`)) {
                    trash.splice(index, 1);
                    persistData();
                    renderTrash();
                }
            });

            actions.appendChild(restoreBtn);
            actions.appendChild(deletePermBtn);

            li.appendChild(itemContainer);
            li.appendChild(actions);
            elements.trashList.appendChild(li);
        });
    }

    function restoreItem(trashIndex) {
        const item = trash[trashIndex];
        if (!item) return;

        if (item.type === 'category') {
            categories.unshift(item.data);
            alert(`Đã phục hồi: ${item.data.name}`);
        }

        trash.splice(trashIndex, 1);
        persistData();
        renderAll();
    }

    function emptyTrash() {
        if (trash.length === 0) return alert("Thùng rác trống.");

        if (confirm(`Xóa vĩnh viễn ${trash.length} mục?`)) {
            trash = [];
            persistData();
            renderTrash();
            alert("Đã xóa.");
        }
    }

    function renderAll() {
        renderNotes();
        renderImportantList();
        renderCategories();
    }

    // =================================================================
    // 6. CATEGORY LOGIC
    // =================================================================

    function handleAddCategory() {
        const catName = prompt("Tên danh mục:");
        if (!catName) return;

        const trimmed = catName.trim();
        if (!trimmed) return;

        if (categories.find(c => c.name === trimmed)) {
            return alert("Danh mục đã tồn tại!");
        }

        categories.push({ name: trimmed, notes: [] });
        persistData();
        renderCategories();
    }

    function handleDeleteCategory(name, index) {
        if (confirm(`Xóa danh mục "${name}"?`)) {
            const cat = categories[index];
            trash.unshift({ type: 'category', data: cat });
            categories.splice(index, 1);
            persistData();
            renderCategories();
            renderTrash();
        }
    }

    function addNoteToCategory(catName) {
        if (!currentNote) return alert("Chọn note trước!");

        const catIndex = categories.findIndex(c => c.name === catName);
        if (catIndex === -1) return;

        const cat = categories[catIndex];
        if (!cat.notes.includes(currentNote.note_id)) {
            cat.notes.push(currentNote.note_id);
            persistData();
            renderCategories();
            alert(`Đã thêm vào "${cat.name}"`);
        } else {
            alert("Đã có trong danh mục!");
        }
        elements.categoryDropdown.parentElement.style.display = 'none';
        isDropdownOpen = false;
    }

    // =================================================================
    // 7. SLASH COMMAND
    // =================================================================

    function handleSlashCommand(e) {
        const el = elements.noteContent;
        const value = el.value;

        if (value.endsWith('/')) {
            elements.slashMenu.classList.add('show');
        } else {
            elements.slashMenu.classList.remove('show');
        }
    }

    function applyFormatting(type) {
        const el = elements.noteContent;
        let prefix = '';

        switch (type) {
            case 'h1': prefix = '# '; break;
            case 'h2': prefix = '## '; break;
            case 'bullet': prefix = '* '; break;
            case 'number': prefix = '1. '; break;
            case 'todo': prefix = '- [ ] '; break;
            case 'separator': prefix = '\n---\n'; break;
            default: prefix = '';
        }

        el.value = prefix + el.value;
        elements.slashMenu.classList.remove('show');
        el.focus();
    }

    // =================================================================
    // 8. EVENT LISTENERS
    // =================================================================

    function setupEventListeners() {
        elements.addNoteBtn.addEventListener("click", createNote);
        elements.noteTitle.addEventListener("input", autoSave);
        elements.noteContent.addEventListener("input", autoSave);
        elements.starBtn.addEventListener("click", toggleImportant);
        elements.deleteBtn.addEventListener("click", deleteNote);
        elements.addCategoryBtn.addEventListener("click", handleAddCategory);
        elements.noteContent.addEventListener('input', handleSlashCommand);

        elements.slashList.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            if (li && li.dataset.type) {
                applyFormatting(li.dataset.type);
            }
        });

        elements.openTrashBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.trashModal.classList.add('show');
            renderTrash();
            document.querySelector('.settings-menu').classList.remove('show');
        });

        elements.closeModalBtn.addEventListener('click', () => {
            elements.trashModal.classList.remove('show');
        });

        elements.trashModal.addEventListener('click', (e) => {
            if (e.target.id === 'trashModal') {
                elements.trashModal.classList.remove('show');
            }
        });

        elements.emptyTrashAllBtn.addEventListener('click', emptyTrash);
        elements.searchBox.addEventListener("input", searchNotes);

        document.querySelector('.menu-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.querySelector('.dropdown-content');
            isDropdownOpen = !isDropdownOpen;
            dropdown.style.display = isDropdownOpen ? 'block' : 'none';
        });

        document.querySelector('.settings-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelector('.settings-menu').classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            const dropdown = document.querySelector('.dropdown-content');
            if (isDropdownOpen && !dropdown.contains(e.target) && !elements.addToCategoryBtn.contains(e.target)) {
                dropdown.style.display = 'none';
                isDropdownOpen = false;
            }

            const settingsMenu = document.querySelector('.settings-menu');
            const settingsBtn = document.querySelector('.settings-btn');
            if (settingsMenu.classList.contains('show') && !settingsMenu.contains(e.target) && !settingsBtn.contains(e.target)) {
                settingsMenu.classList.remove('show');
            }

            if (elements.searchWrapper &&
                !elements.searchWrapper.contains(e.target) &&
                !elements.searchResultsContainer.contains(e.target)) {
                elements.searchResultsContainer.classList.remove("show");
            }

            if (!elements.noteContent.contains(e.target) && !elements.slashMenu.contains(e.target)) {
                elements.slashMenu.classList.remove('show');
            }
        });
    }

    // =================================================================
    // 9. INITIALIZATION
    // =================================================================

    async function init() {
        console.log("🚀 Initializing with API...");

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            console.log('❌ Not logged in');
            window.location.href = 'login.html';
            return;
        }

        console.log('✅ User:', currentUser.username);

        setupEventListeners();

        // ✅ Load từ API
        await loadNotesFromAPI();
    }

    init();

})();