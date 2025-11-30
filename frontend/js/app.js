// Khởi tạo ứng dụng trong một IIFE để tránh xung đột biến toàn cục
(function() {
    "use strict";

    // =================================================================
    // 1. THAM CHIẾU ELEMENTS (Element References)
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
    // 2. TRẠNG THÁI VÀ DỮ LIỆU (State and Data)
    // =================================================================
    let notes = []; // ❌ KHÔNG dùng localStorage nữa, lấy từ API
    let categories = JSON.parse(localStorage.getItem("categories") || "[]");
    let trash = JSON.parse(localStorage.getItem("trash") || "[]");
    let currentNote = null; // Lưu note đang mở (object từ API)
    let saveTimeout = null;
    let isDropdownOpen = false;

    // =================================================================
    // 3. HÀM TIỆN ÍCH (Utility Functions)
    // =================================================================

    /**
     * Cập nhật trạng thái lưu
     */
    function updateSaveStatus(status) {
        elements.saveStatus.textContent = status === "saving" ? "Đang lưu..." : "Đã lưu";
        elements.saveStatus.classList.remove("saving", "saved");
        elements.saveStatus.classList.add(status);
        if (status === "saved") {
            setTimeout(() => { elements.saveStatus.textContent = ""; }, 2000);
        }
    }

    /**
     * Lưu dữ liệu categories và trash vào Local Storage
     */
    function persistData() {
        localStorage.setItem("categories", JSON.stringify(categories));
        localStorage.setItem("trash", JSON.stringify(trash));
    }

    // =================================================================
    // 4. LOGIC GHI CHÚ - TÍCH HỢP API (Note Logic with API)
    // =================================================================

    /**
     * Tải tất cả notes từ Backend
     */
    async function loadNotesFromAPI() {
        try {
            updateSaveStatus("saving");
            elements.notesList.innerHTML = "<li style='color:#999'>Đang tải...</li>";

            notes = await window.NotesAPI.getNotes();
            console.log('✅ Đã tải notes từ API:', notes.length);

            renderAll();
            updateSaveStatus("saved");

            // Tự động mở note đầu tiên
            if (notes.length > 0) {
                openNote(notes[0]);
            }
        } catch (error) {
            console.error('❌ Lỗi tải notes:', error);
            elements.notesList.innerHTML = "<li style='color:red'>Lỗi kết nối server</li>";
            updateSaveStatus("saved");
        }
    }

    /**
     * Mở một ghi chú trong Main View
     */
    function openNote(note) {
        if (!note) return;

        currentNote = note;

        elements.noteTitle.value = note.title || '';
        elements.noteContent.value = note.content || '';

        // ⭐ Logic Ngôi sao
        elements.starBtn.classList.toggle("active", note.is_important);
        elements.starBtn.textContent = note.is_important ? "⭐" : "☆";

        // Đóng dropdown menu
        document.querySelector('.dropdown-content').style.display = 'none';
        isDropdownOpen = false;

        updateSaveStatus("saved");
        renderNotes(); // Cập nhật highlight
    }

    /**
     * Tạo một ghi chú mới
     */
    async function createNote() {
        try {
            updateSaveStatus("saving");

            const newNote = await window.NotesAPI.createNote({
                title: '',
                content: '',
                important: false
            });

            console.log('✅ Đã tạo note mới:', newNote);

            // Thêm vào đầu mảng
            notes.unshift(newNote);

            renderAll();
            openNote(newNote);
            elements.noteTitle.focus();

            updateSaveStatus("saved");
        } catch (error) {
            console.error('❌ Lỗi tạo note:', error);
            alert('Lỗi tạo ghi chú: ' + error.message);
            updateSaveStatus("saved");
        }
    }

    /**
     * Lưu tự động (debounce) khi người dùng gõ
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
                // Gọi API cập nhật
                const updated = await window.NotesAPI.updateNote(currentNote.note_id, {
                    title: updatedTitle,
                    content: updatedContent,
                    is_important: currentNote.is_important
                });

                console.log('✅ Đã lưu note:', updated);

                // Cập nhật object hiện tại
                currentNote.title = updated.title;
                currentNote.content = updated.content;
                currentNote.updated_at = updated.updated_at;

                // Cập nhật trong mảng notes
                const index = notes.findIndex(n => n.note_id === currentNote.note_id);
                if (index !== -1) {
                    notes[index] = currentNote;
                }

                renderAll();
                updateSaveStatus("saved");
            } catch (error) {
                console.error('❌ Lỗi lưu note:', error);
                alert('Lỗi lưu ghi chú: ' + error.message);
                updateSaveStatus("saved");
            }
        }, 800);
    }

    /**
     * Xóa ghi chú đang mở
     */
    async function deleteNote() {
        if (!currentNote) {
            return alert("Chọn note trước!");
        }

        if (!confirm(`Xóa ghi chú "${currentNote.title || 'Untitled'}"?`)) return;

        try {
            updateSaveStatus("saving");

            // Gọi API xóa
            await window.NotesAPI.deleteNote(currentNote.note_id);

            console.log('✅ Đã xóa note:', currentNote.note_id);

            // Xóa khỏi mảng local
            notes = notes.filter(n => n.note_id !== currentNote.note_id);

            // Đặt lại trạng thái
            currentNote = null;
            elements.noteTitle.value = "";
            elements.noteContent.value = "";

            renderAll();

            // Tự động mở note tiếp theo nếu còn
            if (notes.length > 0) {
                openNote(notes[0]);
            }

            updateSaveStatus("saved");
        } catch (error) {
            console.error('❌ Lỗi xóa note:', error);
            alert('Lỗi xóa ghi chú: ' + error.message);
            updateSaveStatus("saved");
        }
    }

    /**
     * Đánh dấu/Bỏ đánh dấu ghi chú là Quan trọng
     */
    async function toggleImportant() {
        if (!currentNote) return alert("Chọn note trước!");

        try {
            updateSaveStatus("saving");

            const newImportantStatus = !currentNote.is_important;

            // Gọi API cập nhật
            const updated = await window.NotesAPI.updateNote(currentNote.note_id, {
                title: currentNote.title,
                content: currentNote.content,
                is_important: newImportantStatus
            });

            console.log('✅ Đã cập nhật trạng thái quan trọng:', updated);

            // Cập nhật UI
            currentNote.is_important = newImportantStatus;
            elements.starBtn.classList.toggle("active", newImportantStatus);
            elements.starBtn.textContent = newImportantStatus ? "⭐" : "☆";

            // Cập nhật trong mảng notes
            const index = notes.findIndex(n => n.note_id === currentNote.note_id);
            if (index !== -1) {
                notes[index].is_important = newImportantStatus;
            }

            renderAll();
            updateSaveStatus("saved");
        } catch (error) {
            console.error('❌ Lỗi cập nhật trạng thái quan trọng:', error);
            alert('Lỗi: ' + error.message);
            updateSaveStatus("saved");
        }
    }

    /**
     * 🔎 Tìm kiếm ghi chú trực tiếp
     */
    async function searchNotes() {
        const query = elements.searchBox.value.toLowerCase().trim();

        elements.searchResultsList.innerHTML = "";
        elements.searchResultsContainer.classList.remove("show");

        if (!query) {
            return;
        }

        try {
            // Gọi API tìm kiếm
            const results = await window.NotesAPI.searchNotes(query);

            console.log('🔍 Kết quả tìm kiếm:', results.length);

            if (results.length === 0) {
                elements.searchResultsList.innerHTML = `<li style='color:#999'>Không tìm thấy.</li>`;
                elements.searchResultsContainer.classList.add("show");
                return;
            }

            // Render kết quả
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
            console.error('❌ Lỗi tìm kiếm:', error);
            elements.searchResultsList.innerHTML = `<li style='color:red'>Lỗi tìm kiếm</li>`;
            elements.searchResultsContainer.classList.add("show");
        }
    }

    // =================================================================
    // 5. LOGIC RENDER (Rendering Logic)
    // =================================================================

    /**
     * Render danh sách ghi chú
     */
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

            // Highlight note đang mở
            if (currentNote && note.note_id === currentNote.note_id) {
                li.classList.add("selected");
            }

            li.addEventListener("click", () => openNote(note));
            elements.notesList.appendChild(li);
        });
    }

    /**
     * Render danh sách ghi chú Quan trọng
     */
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

    /**
     * Render danh sách danh mục
     */
    function renderCategories() {
        elements.categoryList.innerHTML = "";
        elements.categoryDropdown.innerHTML = "";

        if (categories.length === 0) {
            elements.categoryList.innerHTML = "<li style='color:#999'>Chưa có danh mục nào</li>";
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

    /**
     * Render danh sách Thùng rác
     */
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
                if (confirm(`Xóa vĩnh viễn mục "${name}"?`)) {
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
        const itemToRestore = trash[trashIndex];
        if (!itemToRestore) return;

        if (itemToRestore.type === 'category') {
            categories.unshift(itemToRestore.data);
            alert(`Đã phục hồi danh mục: ${itemToRestore.data.name}`);
        }

        trash.splice(trashIndex, 1);
        persistData();
        renderAll();
    }

    function emptyTrash() {
        if (trash.length === 0) return alert("Thùng rác trống.");

        if (confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN ${trash.length} mục trong Thùng rác không?`)) {
            trash = [];
            persistData();
            renderTrash();
            alert("Đã xóa vĩnh viễn Thùng rác.");
        }
    }

    /**
     * Hàm tổng hợp render tất cả
     */
    function renderAll() {
        renderNotes();
        renderImportantList();
        renderCategories();
    }

    // =================================================================
    // 6. LOGIC DANH MỤC (Category Logic)
    // =================================================================

    function handleAddCategory() {
        const catName = prompt("Tên danh mục mới:");
        if (!catName) return;

        const trimmedName = catName.trim();
        if (!trimmedName) return;

        if (categories.find(c => c.name === trimmedName)) {
            return alert("Danh mục đã tồn tại!");
        }

        categories.push({ name: trimmedName, notes: [] });
        persistData();
        renderCategories();
    }

    function handleDeleteCategory(name, index) {
        if (confirm(`Chuyển danh mục "${name}" vào Thùng rác?`)) {
            const categoryToDelete = categories[index];
            trash.unshift({ type: 'category', data: categoryToDelete });
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
            alert(`Đã thêm note vào "${cat.name}"`);
        } else {
            alert("Note đã có trong danh mục này!");
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
    // 8. SỰ KIỆN VÀ KHỞI TẠO (Events and Initialization)
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

    /**
     * Khởi chạy ứng dụng
     */
    async function init() {
        console.log("🚀 Initializing app with API integration...");

        // Kiểm tra đăng nhập
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            console.log('❌ Chưa đăng nhập, chuyển hướng...');
            window.location.href = 'login.html';
            return;
        }

        console.log('✅ User logged in:', currentUser.username);

        setupEventListeners();

        // ✅ QUAN TRỌNG: Load notes từ API thay vì localStorage
        await loadNotesFromAPI();
    }

    // Khởi động
    init();

})();