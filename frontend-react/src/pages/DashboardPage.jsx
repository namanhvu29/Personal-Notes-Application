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
        const newNote = { id: Date.now(), title: '', content: '<div><input type="checkbox"> </div>', isImportant: false };
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

    return (
        <div className="container">
            <Sidebar
                activeTab={activeTab}
                onTabChange={(tab) => { setActiveTab(tab); setSelectedNote(null); }}
                notes={notes}
                onSelectNote={handleSelectNote}
                onAddNote={handleAddNote}
                onLogout={() => navigate('/login')}
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
                    onAddNoteToCategory={(nId, cId) => setNotes(notes.map(n => n.id === nId ? {...n, categoryId: cId} : n))}
                    onAddCategory={handleAddCategory}
                    onRenameCategory={(id, name) => setCategories(categories.map(c => c.id === id ? {...c, name} : c))}
                    onDeleteCategory={(id) => setCategories(categories.filter(c => c.id !== id))}
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
                                    {notes.map(note => (
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

            <TrashModal isOpen={isTrashOpen} onClose={() => setIsTrashOpen(false)} trashItems={trash} onRestore={() => {}} onDeletePermanent={() => {}} onEmptyTrash={() => {}} />
            <CategoryNotesModal isOpen={isCategoryNotesModalOpen} onClose={() => setIsCategoryNotesModalOpen(false)} category={selectedCategory} notes={notes} onSelectNote={handleSelectNote} />
            <CategorySelectionModal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} categories={categories} onSelectCategory={() => {}} onAddCategory={handleAddCategory} onRenameCategory={() => {}} onDeleteCategory={() => {}} />
        </div>
    );
};

export default DashboardPage;