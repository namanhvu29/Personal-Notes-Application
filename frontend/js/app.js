// Khởi tạo ứng dụng trong một IIFE để tránh xung đột biến toàn cục
(function() {
  "use strict";
// new
  // =================================================================
  // 1. THAM CHIẾU ELEMENTS (Element References)
  // =================================================================
  const $ = selector => document.getElementById(selector);

  const elements = {
      // Sidebar Controls
      addNoteBtn: $("addNoteBtn"),
      addCategoryBtn: $("addCategoryBtn"),
      searchBox: $("searchBox"),
      searchResultsContainer: $("searchResultsContainer"), 
      searchResultsList: $("searchResultsList"), 
      searchWrapper: $("searchWrapper"),
      
      // Lists
      notesList: $("notesList"),
      categoryList: $("categoryList"),
      importantList: $("importantList"),
      
      // Note View
      noteTitle: $("noteTitle"),
      noteContent: $("noteContent"),
      starBtn: $("starBtn"),
      deleteBtn: $("deleteBtn"),
      saveStatus: $("saveStatus"),

      // Category Dropdown for Note Actions
      categoryDropdown: $("categoryDropdown"),
      addToCategoryBtn: $("addToCategoryBtn"),
      // THAY ĐỔI: Thùng rác Modal
        openTrashBtn: $("openTrashBtn"), // Nút mở thùng rác trong settings
    trashModal: $("trashModal"),     // Modal Overlay
    closeModalBtn: $("closeModalBtn"), // Nút đóng (X)
    emptyTrashAllBtn: $("emptyTrashAllBtn"), // Nút Xóa tất cả
    trashList: $("trashList"),       // Danh sách bên trong Modal
    slashMenu: $("slashMenu"),
    slashList: $("slashList"),
  };

  // =================================================================
  // 2. TRẠNG THÁI VÀ DỮ LIỆU (State and Data)
  // =================================================================
  let notes = JSON.parse(localStorage.getItem("notes") || "[]");
  let categories = JSON.parse(localStorage.getItem("categories") || "[]"); 
  let trash = JSON.parse(localStorage.getItem("trash") || "[]");
  let currentIndex = null;
  let saveTimeout = null;
  let isDropdownOpen = false; 

  // =================================================================
  // 3. HÀM TIỆN ÍCH (Utility Functions)
  // =================================================================

  /**
   * Cập nhật trạng thái lưu (Đang lưu / Đã lưu)
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
 * Xóa Vĩnh Viễn tất cả các mục trong Thùng rác.
 */
function emptyTrash() {
    if (trash.length === 0) return alert("Thùng rác trống.");

    if (confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN ${trash.length} mục trong Thùng rác không?`)) {
        trash = []; // Reset mảng thùng rác
        persistData();
        renderAll();
        alert("Đã xóa vĩnh viễn Thùng rác.");
    }
}

  /**
   * Lưu dữ liệu vào Local Storage
   */
  function persistData() {
      localStorage.setItem("notes", JSON.stringify(notes));
      localStorage.setItem("categories", JSON.stringify(categories));
      localStorage.setItem("trash", JSON.stringify(trash));
  }
  
  // =================================================================
  // 4. LOGIC GHI CHÚ (Note Logic)
  // =================================================================

  /**
   * Mở một ghi chú trong Main View
   */
  function openNote(index) {
      currentIndex = index;
      const note = notes[index];
      if (!note) return; 

      elements.noteTitle.value = note.title;
      elements.noteContent.value = note.content;
      
      // ⭐ Logic Ngôi sao
      elements.starBtn.classList.toggle("active", note.important);
      elements.starBtn.textContent = note.important ? "⭐" : "☆"; 
      
      // Đóng dropdown menu sau khi chọn note mới
      document.querySelector('.dropdown-content').style.display = 'none'; 
      isDropdownOpen = false;

      updateSaveStatus("saved");
  }

  /**
   * Tạo một ghi chú mới, lưu và mở nó.
   */
  function createNote() {
      const newNote = { title: "", content: "", important: false };
      notes.unshift(newNote); 
      currentIndex = 0; 
      persistData();
      renderAll(); 
      openNote(currentIndex);
      elements.noteTitle.focus();
  }

  /**
   * Lưu tự động (debounce) khi người dùng gõ
   */
  function autoSave() {
      if (currentIndex === null) {
          return createNote(); 
      }

      const note = notes[currentIndex];
      note.title = elements.noteTitle.value;
      note.content = elements.noteContent.value;
      
      updateSaveStatus("saving");
      clearTimeout(saveTimeout);
      
      saveTimeout = setTimeout(() => {
          persistData();
          renderAll(); 
          updateSaveStatus("saved");
      }, 800);
  }

  /**
   * Xóa ghi chú đang mở.
   */
//   function deleteNote() {
//       if (currentIndex === null || notes[currentIndex] === undefined) {
//           return alert("Chọn note trước!");
//       }
//       if (!confirm(`Xóa ghi chú "${notes[currentIndex].title || 'Untitled'}"?`)) return;

//       notes.splice(currentIndex, 1);
      
//       // Cập nhật lại index trong categories
//       categories.forEach(c => {
//           c.notes = c.notes
//               .filter(index => index !== currentIndex) 
//               .map(index => index > currentIndex ? index - 1 : index); 
//       });
      
//       persistData();

//       currentIndex = null;
//       elements.noteTitle.value = "";
//       elements.noteContent.value = "";
      
//       renderAll();
//       updateSaveStatus("saved");
//   }
function deleteNote() {
    if (currentIndex === null || notes[currentIndex] === undefined) {
        return alert("Chọn note trước!");
    }
    if (!confirm(`Chuyển ghi chú "${notes[currentIndex].title || 'Untitled'}" vào Thùng rác?`)) return;

    // Lấy note cần xóa
    const noteToDelete = notes[currentIndex];
    
    // 🔑 THAY ĐỔI: Chuyển note vào mảng trash và gán type
    trash.unshift({ 
        type: 'note', 
        data: noteToDelete, 
        originalIndex: currentIndex // Giữ lại index cũ (tùy chọn)
    });

    // 🔑 XÓA: Xóa note khỏi mảng chính
    notes.splice(currentIndex, 1);
    
    // Cập nhật lại index trong categories (Logic giữ nguyên)
    categories.forEach(c => {
        c.notes = c.notes
            .filter(index => index !== currentIndex) 
            .map(index => index > currentIndex ? index - 1 : index); 
    });
    
    persistData();

    // Đặt lại trạng thái
    currentIndex = null;
    elements.noteTitle.value = "";
    elements.noteContent.value = "";
    
    renderAll();
    updateSaveStatus("saved");
}

  /**
   * Đánh dấu/Bỏ đánh dấu ghi chú là Quan trọng
   */
  function toggleImportant() {
      if (currentIndex === null) return alert("Chọn note trước!");
      
      notes[currentIndex].important = !notes[currentIndex].important;
      persistData();
      
      // ⭐ Logic Ngôi sao
      const isActive = notes[currentIndex].important;
      elements.starBtn.classList.toggle("active", isActive);
      elements.starBtn.textContent = isActive ? "⭐" : "☆"; 

      renderAll();
  }
  
  /**
   * 🔎 Tìm kiếm ghi chú trực tiếp (Live Search)
   */
  function searchNotes() {
      const query = elements.searchBox.value.toLowerCase().trim();

      console.log("Search query:", query);
      console.log("Total notes:", notes.length);
      console.log("Notes data:", notes);
    
      elements.searchResultsList.innerHTML = "";
      elements.searchResultsContainer.classList.remove("show");

      if (!query) {
          return;
      }

      // Lọc ghi chú: tìm trong tiêu đề HOẶC nội dung
      const filteredNotes = notes.filter(note => {
          const titleMatch = note.title && note.title.toLowerCase().includes(query);
          const contentMatch = note.content && note.content.toLowerCase().includes(query);
          console.log(`Note "${note.title}": titleMatch=${titleMatch}, contentMatch=${contentMatch}`);
          return titleMatch || contentMatch;
      });

      console.log("Filtered notes:", filteredNotes);

      if (filteredNotes.length === 0) {
          elements.searchResultsList.innerHTML = `<li style='color:#999'>Không tìm thấy.</li>`;
          elements.searchResultsContainer.classList.add("show");
          return;
      }

      // Render kết quả
      filteredNotes.forEach(note => {
          const li = document.createElement("li");
          li.textContent = note.title || "Untitled";

          // Sự kiện click: Mở note và ẩn kết quả
          li.addEventListener("click", (e) => {
              e.stopPropagation();
              const index = notes.indexOf(note);
              openNote(index);
              elements.searchBox.value = "";
              elements.searchResultsContainer.classList.remove("show");
              // Khi mở note từ kết quả tìm kiếm, cần đảm bảo danh sách notesList được render lại
              renderNotes();
          });

          elements.searchResultsList.appendChild(li);
      });

      elements.searchResultsContainer.classList.add("show");
  }
  /**
 * Phục hồi mục đã xóa từ Thùng rác.
 * @param {number} trashIndex - Index của mục trong mảng trash.
 */
function restoreItem(trashIndex) {
    const itemToRestore = trash[trashIndex];
    if (!itemToRestore) return;

    if (itemToRestore.type === 'note') {
        // Phục hồi Note: Thêm lại vào đầu mảng notes
        notes.unshift(itemToRestore.data);
        alert(`Đã phục hồi ghi chú: ${itemToRestore.data.title || 'Untitled'}`);
    } else if (itemToRestore.type === 'category') {
        // Phục hồi Category: Thêm lại vào đầu mảng categories
        categories.unshift(itemToRestore.data);
        alert(`Đã phục hồi danh mục: ${itemToRestore.data.name}`);
    }

    // Xóa khỏi thùng rác
    trash.splice(trashIndex, 1);
    
    persistData();
    renderAll();
}
/**
 * Lấy vị trí con trỏ trong textarea.
 */
function getCursorPosition(el) {
    return el.selectionStart;
}

/**
 * Hiển thị/Ẩn menu Slash Command khi gõ '/'.
 * @param {Event} e - Sự kiện gõ phím.
 */
function handleSlashCommand(e) {
    const el = elements.noteContent;
    const value = el.value;
    const cursor = getCursorPosition(el);

    // Lấy ký tự ngay trước con trỏ
    const precedingChar = value.substring(cursor - 1, cursor);
    
    // // 1. Kiểm tra nếu gõ '/'
    // if (e.key === '/') {
    //     // Hiển thị menu tại vị trí con trỏ
    //     elements.slashMenu.classList.add('show');
        
    //     // Vị trí (rất phức tạp với textarea, ta sẽ dùng vị trí tĩnh hoặc tương đối)
    //     // Dùng vị trí tĩnh đơn giản:
    //     elements.slashMenu.style.top = (e.target.offsetTop + 30) + 'px'; 
    //     elements.slashMenu.style.left = '20px'; // Nằm bên trái textarea
        
    // } else if (e.key === 'Backspace' && value.substring(cursor - 2, cursor - 1) !== '/') {
    //     // 2. Ẩn menu nếu Backspace và không phải xóa dấu '/'
    //     elements.slashMenu.classList.remove('show');
    // }
    
    // // 3. Ẩn menu nếu gõ bất kỳ ký tự nào khác sau dấu '/'
    // if (elements.slashMenu.classList.contains('show') && e.key.length === 1 && e.key !== '/') {
    //     // Bạn có thể thêm logic lọc list tại đây nếu cần (ví dụ: gõ /h thì lọc ra Heading)
    // }
    // 1. Kiểm tra nếu ký tự cuối cùng là '/'
    if (value.endsWith('/')) {
        // Hiển thị menu
        elements.slashMenu.classList.add('show');
        
        // Cố gắng định vị menu gần con trỏ (cần CSS cho vị trí tương đối)
        // Hiện tại, ta chỉ dùng vị trí tĩnh đã định nghĩa trong CSS
        
    } else {
        // Nếu không phải '/', ẩn menu
        elements.slashMenu.classList.remove('show');
    }
}


/**
 * Áp dụng định dạng (chèn cú pháp Markdown) khi chọn từ menu.
 * @param {string} type - Loại định dạng (h1, bullet, todo, etc.)
 */
function applyFormatting(type) {
    const el = elements.noteContent;
    let prefix = '';
    
    switch (type) {
        case 'h1':
            prefix = '# ';
            break;
        case 'h2':
            prefix = '## ';
            break;
        case 'bullet':
            prefix = '* ';
            break;
        case 'number':
            prefix = '1. ';
            break;
        case 'todo':
            prefix = '- [ ] ';
            break;
        case 'separator':
            prefix = '\n---\n'; //  Chèn dấu phân cách
            break;
        case 'text':
        default:
            prefix = '';
    }

    // Chèn prefix vào đầu dòng hiện tại (Đơn giản nhất là chèn vào đầu nội dung)
    el.value = prefix + el.value; 

    elements.slashMenu.classList.remove('show');
    el.focus();
}


  // =================================================================
  // 5. LOGIC RENDER (Rendering Logic)
  // =================================================================

  /**
   * Render danh sách ghi chú (Main Notes List)
   */
// function renderNotes() {
//     elements.notesList.innerHTML = "";
    
//     // Đảm bảo ẩn kết quả tìm kiếm khi danh sách chính được render
//     elements.searchResultsContainer.classList.remove("show");

//     if (notes.length === 0) {
//         elements.notesList.innerHTML = "<li style='color:#999'>Chưa có ghi chú</li>";
//         return;
//     }

//     notes.forEach((note, index) => {
//         const li = document.createElement("li");
//         li.textContent = note.title || "Untitled";
//         if (note.important) li.classList.add("important");
        
//         // 🔑 ĐIỀU KIỆN SỬA LỖI: Chỉ highlight nếu note đang mở và KHÔNG phải là note rỗng (mới tạo)
//         const isContentPresent = note.title.trim() !== '' || note.content.trim() !== '';

//         if (index === currentIndex && isContentPresent) {
//             li.classList.add("selected"); 
//         } 

//         li.addEventListener("click", () => openNote(index));
//         elements.notesList.appendChild(li);
//     });
// }
function renderNotes() {
    elements.notesList.innerHTML = "";
    
    // Đảm bảo ẩn kết quả tìm kiếm khi danh sách chính được render (Đúng)
    elements.searchResultsContainer.classList.remove("show");

    // 🔑 BỔ SUNG: Đảm bảo khối sections luôn được hiển thị khi render danh sách chính
    const sections = document.querySelector('.sections');
    if (sections) sections.style.display = 'flex'; // Hiện lại sections

    if (notes.length === 0) {
        elements.notesList.innerHTML = "<li style='color:#999'>Chưa có ghi chú</li>";
        return;
    }

    notes.forEach((note, index) => {
        const li = document.createElement("li");
        li.textContent = note.title || "Untitled";
        if (note.important) li.classList.add("important");
        
        // Logic để không highlight note rỗng (từ sửa lỗi trước đó)
        const isContentPresent = note.title.trim() !== '' || note.content.trim() !== '';

        // 🔑 SỬA LỖI HIGHLIGHT: Áp dụng class "selected"
        if (index === currentIndex && isContentPresent) {
            li.classList.add("selected"); 
        } 
        
        // Sự kiện click gọi openNote, sau đó openNote gọi renderAll (chứa renderNotes)
        // Logic đã đúng, không cần thay đổi sự kiện click tại đây.
        li.addEventListener("click", () => openNote(index));
        elements.notesList.appendChild(li);
    });
}
  
  /**
   * Render danh sách ghi chú Quan trọng
   */
  function renderImportantList() {
      elements.importantList.innerHTML = "";
      const importantNotes = notes.filter(n => n.important);
      
      if (importantNotes.length === 0) {
          elements.importantList.innerHTML = "<li style='color:#999'>Không có ghi chú quan trọng</li>";
          return;
      }
      
      importantNotes.forEach(note => {
          const index = notes.indexOf(note);
          if (index === -1) return; 
          
          const li = document.createElement("li");
          li.textContent = note.title || "Untitled";
          li.addEventListener("click", () => openNote(index));
          elements.importantList.appendChild(li);
      });
  }

  /**
   * Render danh sách danh mục (Categories) và Dropdown cho Note Action
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
          // ... (Logic render categories giữ nguyên) ...
          
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

          cat.notes.forEach(noteIndex => {
              const note = notes[noteIndex];
              if (!note) return;
              const noteLi = document.createElement("li");
              noteLi.textContent = note.title || "Untitled";
              noteLi.addEventListener("click", (e) => {
                  e.stopPropagation(); 
                  openNote(noteIndex);
              });
              notesUl.appendChild(noteLi);
          });

          span.addEventListener("click", () => {
              notesUl.style.display = notesUl.style.display === "none" ? "block" : "none";
          });
          span.addEventListener("dblclick", (e) => {
              e.stopPropagation();
              handleRenameCategory(cat, catIndex);
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
 * Render danh sách Thùng rác (Trash List)
 */
function renderTrash() {
    elements.trashList.innerHTML = "";
    
    if (trash.length === 0) {
        elements.trashList.innerHTML = "<li style='color:#999'>Thùng rác trống</li>";
        return;
    }
    
    // Thêm nút Xóa Vĩnh Viễn Toàn bộ ở trên cùng
    const emptyBtnLi = document.createElement("li");
    const emptyBtn = document.createElement("button");
    emptyBtn.textContent = "🗑️ Xóa Vĩnh Viễn Tất Cả";
    emptyBtn.classList.add("empty-trash-btn");
    emptyBtn.addEventListener('click', emptyTrash);
    emptyBtnLi.appendChild(emptyBtn);
    elements.trashList.appendChild(emptyBtnLi);


    trash.forEach((item, index) => {
        const li = document.createElement("li");
        li.classList.add('trash-item');

        const name = item.data.title || item.data.name || "Mục không tên";
        
        // Vùng chứa tên và nút
        const itemContainer = document.createElement("div");
        itemContainer.classList.add('trash-item-container');
        itemContainer.innerHTML = `<span>[${item.type.charAt(0).toUpperCase()}] ${name}</span>`;

        // Vùng chứa các nút hành động
        const actions = document.createElement("div");
        actions.classList.add('trash-item-actions');

        // Nút Phục hồi
        const restoreBtn = document.createElement("button");
        restoreBtn.textContent = "↩️ Phục hồi";
        restoreBtn.classList.add('restore-btn');
        restoreBtn.addEventListener('click', (e) => {
            e.stopPropagation();git checkout search_categories_important
            restoreItem(index);
        });

        // Nút Xóa Vĩnh Viễn riêng lẻ
        const deletePermBtn = document.createElement("button");
        deletePermBtn.textContent = "❌ Xóa";
        deletePermBtn.classList.add('delete-perm-btn');
        deletePermBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Xóa vĩnh viễn mục "${name}"?`)) {
                 // Xóa khỏi mảng trash (chỉ đơn giản là splice)
                trash.splice(index, 1);
                persistData();
                renderAll();
            }
        });
        
        actions.appendChild(restoreBtn);
        actions.appendChild(deletePermBtn);
        
        li.appendChild(itemContainer);
        li.appendChild(actions);
        elements.trashList.appendChild(li);
    });
}

  /**
   * Hàm tổng hợp render tất cả list trong Sidebar
   */
  function renderAll() {
      renderNotes();
      renderImportantList();
      renderCategories();
      
  }


  // =================================================================
  // 6. LOGIC DANH MỤC (Category Logic)
  // =================================================================
  // ... (Các hàm category giữ nguyên) ...

  /**
   * Xử lý thêm danh mục mới
   */
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

  /**
   * Xử lý đổi tên danh mục
   */
  function handleRenameCategory(cat, catIndex) {
      const newName = prompt("Đổi tên danh mục:", cat.name);
      if (newName && newName.trim() !== cat.name) {
          cat.name = newName.trim();
          persistData();
          renderCategories();
      }
  }

  /**
   * Xử lý xóa danh mục
   */
//   function handleDeleteCategory(name, index) {
//       if (confirm(`Xóa danh mục "${name}"? Thao tác này KHÔNG xóa ghi chú bên trong.`)) {
//           categories.splice(index, 1);
//           persistData();
//           renderCategories();
//       }
//   }
  function handleDeleteCategory(name, index) {
    if (confirm(`Chuyển danh mục "${name}" vào Thùng rác? Thao tác này KHÔNG xóa ghi chú bên trong.`)) {
        
        // Lấy category cần xóa
        const categoryToDelete = categories[index];
        
        // 🔑 THAY ĐỔI: Chuyển category vào mảng trash
        trash.unshift({ 
            type: 'category', 
            data: categoryToDelete 
        });

        // 🔑 XÓA: Xóa category khỏi mảng chính
        categories.splice(index, 1);
        
        persistData();
        renderCategories();
        renderTrash(); // Gọi hàm render thùng rác
    }
}

  /**
   * Thêm ghi chú đang mở vào một danh mục
   */
  function addNoteToCategory(catName) {
      if (currentIndex === null) return alert("Chọn note trước!");
      
      const catIndex = categories.findIndex(c => c.name === catName);
      if (catIndex === -1) return; 

      const cat = categories[catIndex];
      if (!cat.notes.includes(currentIndex)) {
          cat.notes.push(currentIndex);
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
  // 7. SỰ KIỆN VÀ KHỞI TẠO (Events and Initialization)
  // =================================================================
  
  /**
   * Thiết lập các Event Listener chính
   */
  function setupEventListeners() {
      // Note & Category Actions
      elements.addNoteBtn.addEventListener("click", createNote);
      elements.noteTitle.addEventListener("input", autoSave);
      elements.noteContent.addEventListener("input", autoSave);
      elements.starBtn.addEventListener("click", toggleImportant);
      elements.deleteBtn.addEventListener("click", deleteNote);
      elements.addCategoryBtn.addEventListener("click", handleAddCategory);
      elements.noteContent.addEventListener('input', handleSlashCommand);
    // 🔑 THÊM MỚI: Lắng nghe click từ menu
    elements.slashList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (li && li.dataset.type) {
            applyFormatting(li.dataset.type);
        }
    });
    // 🔑 LOGIC MODAL THÙNG RÁC
    
    // Mở Modal
    elements.openTrashBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.trashModal.classList.add('show');
        renderTrash(); // Render danh sách mỗi khi mở
        
        // Đóng Settings Menu khi mở Modal
        document.querySelector('.settings-menu').classList.remove('show');
    });

    // Đóng Modal (Nút X)
    elements.closeModalBtn.addEventListener('click', () => {
        elements.trashModal.classList.remove('show');
    });

    // Đóng Modal (Click bên ngoài)
    elements.trashModal.addEventListener('click', (e) => {
        // Nếu click chính xác vào modal-overlay (không phải modal-content)
        if (e.target.id === 'trashModal') {
            elements.trashModal.classList.remove('show');
        }
    });

    // Sự kiện cho nút Xóa Vĩnh Viễn Toàn bộ
    elements.emptyTrashAllBtn.addEventListener('click', emptyTrash);

      // 🔎 Tìm kiếm
      elements.searchBox.addEventListener("input", searchNotes);
      
      // Toggle Dropdown menu note (⋮)
      document.querySelector('.menu-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          const dropdown = document.querySelector('.dropdown-content');
          isDropdownOpen = !isDropdownOpen;
          dropdown.style.display = isDropdownOpen ? 'block' : 'none';
      });

      // Toggle Settings menu (⚙️)
      document.querySelector('.settings-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          document.querySelector('.settings-menu').classList.toggle('show');
      });

      // Click ngoài để đóng Dropdowns
      document.addEventListener('click', (e) => {
          // Đóng Note Action Dropdown
          const dropdown = document.querySelector('.dropdown-content');
          if (isDropdownOpen && !dropdown.contains(e.target) && !elements.addToCategoryBtn.contains(e.target)) {
              dropdown.style.display = 'none';
              isDropdownOpen = false;
          }

          // Đóng Settings menu
          const settingsMenu = document.querySelector('.settings-menu');
          const settingsBtn = document.querySelector('.settings-btn');
          if (settingsMenu.classList.contains('show') && !settingsMenu.contains(e.target) && !settingsBtn.contains(e.target)) {
              settingsMenu.classList.remove('show');
          }

          // Đóng Search Results
            // Đóng Search Results
        // 🔑 Sửa: Thêm kiểm tra elements.searchWrapper để tránh lỗi Reference Error
        if (elements.searchWrapper && 
            !elements.searchWrapper.contains(e.target) && 
            !elements.searchResultsContainer.contains(e.target)) {
            
            elements.searchResultsContainer.classList.remove("show");
        } 
        // 🔑 Logic ẩn Slash Menu
        if (!elements.noteContent.contains(e.target) && !elements.slashMenu.contains(e.target)) {
            elements.slashMenu.classList.remove('show');
        }
      });
  }

  /**
   * Khởi chạy ứng dụng
   */
  function init() {
      console.log("Initializing app...");
      console.log("Notes loaded:", notes);
      setupEventListeners();
      renderAll();

      // Tự động mở note đầu tiên nếu có
      if (notes.length > 0) {
          openNote(0);
      } else {
          updateSaveStatus("saved");
          elements.noteTitle.value = "";
          elements.noteContent.value = "";
      }
  }

  // Khởi động
  init();

})();
