const titleInput = document.getElementById('noteTitle');
const contentInput = document.getElementById('noteContent');
const saveBtn = document.getElementById('saveNote');
const listContainer = document.getElementById('noteList');
const searchInput = document.getElementById('searchInput');

let notes = JSON.parse(localStorage.getItem('notes') || '[]');

function renderNotes(filter = '') {
  listContainer.innerHTML = '';
  const filtered = notes.filter(n => 
    n.title.toLowerCase().includes(filter.toLowerCase()) ||
    n.content.toLowerCase().includes(filter.toLowerCase())
  );
  filtered.forEach((note, i) => {
    const div = document.createElement('div');
    div.className = 'note';
    div.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.content}</p>
      <button onclick="editNote(${i})">Sửa</button>
      <button onclick="deleteNote(${i})">Xóa</button>
    `;
    listContainer.appendChild(div);
  });
}

function saveNote() {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  if (!title || !content) return alert('Nhập tiêu đề và nội dung');
  notes.push({ title, content });
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes();
  titleInput.value = '';
  contentInput.value = '';
}

function editNote(index) {
  const note = notes[index];
  titleInput.value = note.title;
  contentInput.value = note.content;
  deleteNote(index);
}

function deleteNote(index) {
  notes.splice(index, 1);
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes(searchInput.value);
}

saveBtn.addEventListener('click', saveNote);
searchInput.addEventListener('input', e => renderNotes(e.target.value));

renderNotes();
