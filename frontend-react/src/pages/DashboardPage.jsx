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
        { id: 1, name: 'Công việc' },
        { id: 2, name: 'Cá nhân' },
        { id: 3, name: 'Học tập' }
    ]);

    // Trash State
    const [trash, setTrash] = useState([]);
    const [isTrashOpen, setIsTrashOpen] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');

    // Category State
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isCategoryNotesModalOpen, setIsCategoryNotesModalOpen] = useState(false);

    // Modal States
    const [showCategoryModal, setShowCategoryModal] = useState(false); // For "Danh mục" management

    useEffect(() => {
        // Mock data
        const mockNotes = [
            { id: 1, title: 'Ghi chú mẫu 1', content: 'Nội dung ghi chú mẫu 1', isImportant: false, categoryId: null, type: 'note' },
            { id: 2, title: 'Ghi chú quan trọng', content: 'Nội dung quan trọng', isImportant: true, categoryId: 1, type: 'note' },
            { id: 3, title: 'Việc cần làm', content: '<div><input type="checkbox"> Mua sữa</div>', isImportant: false, categoryId: 2, type: 'todo' },
        ];
        setNotes(mockNotes);
    }, []);

    // Filter notes based on search query
    const filteredNotes = notes.filter(note => {
        // Filter by Search Query
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (note.title && note.title.toLowerCase().includes(query)) ||
            (note.content && note.content.toLowerCase().includes(query));
    });

    const handleSelectNote = (note) => {
        setSelectedNote(note);
    };

    const handleAddNote = () => {
        const newNote = {
            id: Date.now(),
            title: '',
            content: '',
            isImportant: false,
            type: 'note'
        };
        setNotes([newNote, ...notes]);
        setSelectedNote(newNote);
        setSearchQuery('');
    };

    const handleAddTodo = () => {
        const newTodo = {
            id: Date.now(),
            title: '',
            content: '<div><input type="checkbox"> </div>',
            isImportant: false,
            type: 'todo'
        };
        setNotes([newTodo, ...notes]);
        setSelectedNote(newTodo);
        setSearchQuery('');
    };

    const handleUpdateNote = (updatedNote) => {
        setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n));
        setSelectedNote(updatedNote);
    };

    // Soft Delete Note
    const handleMoveNoteToTrash = (noteId) => {
        const noteToDelete = notes.find(n => n.id === noteId);
        if (noteToDelete) {
            if (window.confirm(`Chuyển ghi chú "${noteToDelete.title || 'Untitled'}" vào Thùng rác?`)) {
                setTrash([{ type: 'note', data: noteToDelete }, ...trash]);
                setNotes(notes.filter(n => n.id !== noteId));
                if (selectedNote && selectedNote.id === noteId) {
                    setSelectedNote(null);
                }
            }
        }
    };

    // Trash Actions
    const handleRestore = (index) => {
        const itemToRestore = trash[index];
        if (itemToRestore.type === 'note') {
            setNotes([itemToRestore.data, ...notes]);
        } else if (itemToRestore.type === 'category') {
            setCategories([itemToRestore.data, ...categories]);
        }
        const newTrash = [...trash];
        newTrash.splice(index, 1);
        setTrash(newTrash);
    };

    const handleDeletePermanent = (index) => {
        if (window.confirm("Xóa vĩnh viễn mục này?")) {
            const newTrash = [...trash];
            newTrash.splice(index, 1);
            setTrash(newTrash);
        }
    };

    const handleEmptyTrash = () => {
        if (window.confirm("Bạn có chắc chắn muốn XÓA VĨNH VIỄN tất cả mục trong Thùng rác không?")) {
            setTrash([]);
        }
    };

    // Category Actions
    const handleAddCategory = (nameInput) => {
        let name = nameInput;
        if (typeof name !== 'string') {
            name = prompt("Tên danh mục mới:");
        }

        if (name && name.trim()) {
            setCategories([...categories, { id: Date.now(), name: name.trim() }]);
        }
    };

    const handleRenameCategory = (id, oldNameOrNewName) => {
        const category = categories.find(c => c.id === id);
        if (!category) return;

        let newName = oldNameOrNewName;

        if (newName === category.name) {
            const input = prompt("Đổi tên danh mục:", category.name);
            if (input) newName = input;
            else return;
        }

        if (newName && newName.trim() && newName.trim() !== category.name) {
            setCategories(categories.map(c => c.id === id ? { ...c, name: newName.trim() } : c));
        }
    };

    const handleDeleteCategory = (id, name) => {
        if (window.confirm(`Chuyển danh mục "${name}" vào Thùng rác?`)) {
            const catToDelete = categories.find(c => c.id === id);
            if (catToDelete) {
                setTrash([{ type: 'category', data: catToDelete }, ...trash]);
                setCategories(categories.filter(c => c.id !== id));
            }
        }
    };

    const handleAddNoteToCategory = (noteId, categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        if (category) {
            setNotes(notes.map(n => n.id === noteId ? { ...n, categoryId: categoryId } : n));
            alert(`Đã thêm note vào danh mục: ${category.name}`);
        }
    };

    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
        if (category) {
            setIsCategoryNotesModalOpen(true);
        } else {
            // If category is null (e.g. clicking "All Notes"), just clear selection
            setIsCategoryNotesModalOpen(false);
        }
        setSearchQuery('');
    };

    const handleMoveNoteToCategory = (noteId, categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        if (category) {
            setNotes(notes.map(n => n.id === noteId ? { ...n, categoryId: categoryId } : n));
            // Optional: Show a toast or notification
            console.log(`Moved note ${noteId} to category ${category.name}`);
        }
    };

    const handleLogout = () => {
        // TODO: Clear auth token
        navigate('/login');
    };

    return (
        <div className="container">
            <Sidebar
                notes={filteredNotes}
                onSelectNote={handleSelectNote}
                onAddNote={handleAddNote}
                onAddTodo={handleAddTodo}
                categories={categories}
                onAddCategory={handleAddCategory}
                onRenameCategory={handleRenameCategory}
                onDeleteCategory={handleDeleteCategory}
                onMoveNoteToCategory={handleMoveNoteToCategory}
                onLogout={handleLogout}
                onOpenTrash={() => setIsTrashOpen(true)}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
            />
            <NoteView
                note={selectedNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleMoveNoteToTrash}
                categories={categories}
                onAddNoteToCategory={handleAddNoteToCategory}
                onAddCategory={handleAddCategory}
                onRenameCategory={handleRenameCategory}
                onDeleteCategory={handleDeleteCategory}
            />

            <TrashModal
                isOpen={isTrashOpen}
                onClose={() => setIsTrashOpen(false)}
                trashItems={trash}
                onRestore={handleRestore}
                onDeletePermanent={handleDeletePermanent}
                onEmptyTrash={handleEmptyTrash}
            />

            <CategoryNotesModal
                isOpen={isCategoryNotesModalOpen}
                onClose={() => setIsCategoryNotesModalOpen(false)}
                category={selectedCategory}
                notes={notes}
                onSelectNote={(note) => {
                    handleSelectNote(note);
                    setIsCategoryNotesModalOpen(false);
                }}
            />

            <CategorySelectionModal
                isOpen={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                categories={categories}
                onSelectCategory={(categoryId) => {
                    const category = categories.find(c => c.id === categoryId);
                    if (category) {
                        setShowCategoryModal(false);
                        handleSelectCategory(category);
                    }
                }}
                onAddCategory={handleAddCategory}
                onRenameCategory={handleRenameCategory}
                onDeleteCategory={handleDeleteCategory}
            />
        </div>
    );
};

export default DashboardPage;
