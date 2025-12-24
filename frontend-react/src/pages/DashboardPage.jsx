// DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NoteView from '../components/NoteView';
import TrashModal from '../components/TrashModal';
import CategoryNotesModal from '../components/CategoryNotesModal';
import CategorySelectionModal from '../components/CategorySelectionModal';
import '../assets/css/style.css';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [categories, setCategories] = useState([
        { id: 1, name: 'Công việc' }, { id: 2, name: 'Cá nhân' }, { id: 3, name: 'Học tập' }
    ]);

    const [trash, setTrash] = useState([]);
    const [isTrashOpen, setIsTrashOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('notes');

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isCategoryNotesModalOpen, setIsCategoryNotesModalOpen] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    useEffect(() => {
        const mockNotes = [
            { id: 1, title: 'Việc cần làm', content: '<div><input type="checkbox" checked="true"> Mua sữa</div>', isImportant: false, categoryId: null },
            { id: 2, title: 'Ghi chú quan trọng', content: 'Nội dung quan trọng', isImportant: true, categoryId: 1 },
        ];
        setNotes(mockNotes);
    }, []);

    const handleSelectNote = (note) => setSelectedNote(note);

    const handleAddNote = () => {
        const newNote = { id: Date.now(), title: '', content: '', isImportant: false };
        setNotes([newNote, ...notes]);
        setSelectedNote(newNote);
    };

    const handleUpdateNote = (updatedNote) => {
        setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n));
        setSelectedNote(updatedNote);
    };

    const handleMoveNoteToTrash = (noteId) => {
        const noteToDelete = notes.find(n => n.id === noteId);
        if (noteToDelete && window.confirm(`Xóa ghi chú?`)) {
            setTrash([{ type: 'note', data: noteToDelete }, ...trash]);
            setNotes(notes.filter(n => n.id !== noteId));
            setSelectedNote(null);
        }
    };

    const handleAddCategory = (name) => {
        const catName = name || prompt("Tên danh mục mới:");
        if (catName) setCategories([...categories, { id: Date.now(), name: catName }]);
    };

    const filteredNotes = notes.filter(note => {
        const query = searchQuery.toLowerCase();
        return (note.title && note.title.toLowerCase().includes(query)) ||
            (note.content && note.content.toLowerCase().includes(query));
    });

    const handleRenameCategory = (id, newName) => {
        setCategories(categories.map(c => c.id === id ? { ...c, name: newName } : c));
    };

    const handleDeleteCategory = (id) => {
        const categoryToDelete = categories.find(c => c.id === id);
        if (categoryToDelete && window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
            setTrash([{ type: 'category', data: categoryToDelete }, ...trash]);
            setCategories(categories.filter(c => c.id !== id));
            // Update notes in this category to have no category
            setNotes(notes.map(n => n.categoryId === id ? { ...n, categoryId: null } : n));
        }
    };

    const handleRestoreFromTrash = (index) => {
        const itemToRestore = trash[index];
        if (!itemToRestore) return;

        if (itemToRestore.type === 'note') {
            setNotes([itemToRestore.data, ...notes]);
        } else if (itemToRestore.type === 'category') {
            setCategories([...categories, itemToRestore.data]);
        }

        const newTrash = [...trash];
        newTrash.splice(index, 1);
        setTrash(newTrash);
    };

    const handleDeletePermanent = (index) => {
        if (window.confirm('Hành động này không thể hoàn tác. Bạn chắc chắn chứ?')) {
            const newTrash = [...trash];
            newTrash.splice(index, 1);
            setTrash(newTrash);
        }
    };

    const handleEmptyTrash = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tất cả thùng rác?')) {
            setTrash([]);
        }
    };

    return (
        <div className="container">
            <Sidebar
                activeTab={activeTab}
                onTabChange={(tab) => { setActiveTab(tab); setSelectedNote(null); }}
                notes={filteredNotes}
                onSelectNote={handleSelectNote}
                onAddNote={handleAddNote}
                onLogout={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('currentUser');
                    navigate('/login');
                }}
                onOpenTrash={() => setIsTrashOpen(true)}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
            />

            {selectedNote ? (
                <NoteView
                    note={selectedNote}
                    onUpdateNote={handleUpdateNote}
                    onDeleteNote={handleMoveNoteToTrash}
                    categories={categories}
                    onAddNoteToCategory={(nId, cId) => setNotes(notes.map(n => n.id === nId ? { ...n, categoryId: cId } : n))}
                    onAddCategory={handleAddCategory}
                    onRenameCategory={handleRenameCategory}
                    onDeleteCategory={handleDeleteCategory}
                />
            ) : (
                <main className="note-view">
                    <div className="tab-content-wrapper">
                        {activeTab === 'notes' && (
                            <div className="tab-section">
                                <h2>📝 Tất cả ghi chú</h2>
                                <div className="notes-grid">
                                    <div className="note-card add-note-card" onClick={handleAddNote}>
                                        <div className="add-note-content"><span className="add-icon">+</span><span>Tạo ghi chú mới</span></div>
                                    </div>
                                    {filteredNotes.map(note => (
                                        <div key={note.id} className="note-card" onClick={() => handleSelectNote(note)}>
                                            <h3>{note.title || 'Không có tiêu đề'}</h3>
                                            <p>{note.content ? note.content.replace(/<input[^>]*>/g, '☐ ').replace(/<[^>]*>/g, '').substring(0, 50) : 'Trống'}...</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'categories' && (
                            <div className="tab-section">
                                <h2>🏷️ Danh mục</h2>
                                <div className="categories-grid">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="category-card" onClick={() => { setSelectedCategory(cat); setIsCategoryNotesModalOpen(true); }}>
                                            <span className="cat-icon">📂</span><span className="cat-name">{cat.name}</span>
                                        </div>
                                    ))}
                                    <div className="category-card add-category-card" onClick={() => setShowCategoryModal(true)}>
                                        <span className="cat-icon">+</span><span className="cat-name">Quản lý/Thêm</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            )}

            <TrashModal
                isOpen={isTrashOpen}
                onClose={() => setIsTrashOpen(false)}
                trashItems={trash}
                onRestore={handleRestoreFromTrash}
                onDeletePermanent={handleDeletePermanent}
                onEmptyTrash={handleEmptyTrash}
            />
            <CategoryNotesModal isOpen={isCategoryNotesModalOpen} onClose={() => setIsCategoryNotesModalOpen(false)} category={selectedCategory} notes={notes} onSelectNote={handleSelectNote} />
            <CategorySelectionModal
                isOpen={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                categories={categories}
                onSelectCategory={() => { }}
                onAddCategory={handleAddCategory}
                onRenameCategory={handleRenameCategory}
                onDeleteCategory={handleDeleteCategory}
            />
        </div>
    );
};

export default DashboardPage;