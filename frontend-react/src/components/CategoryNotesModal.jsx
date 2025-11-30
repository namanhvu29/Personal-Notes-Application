import React from 'react';

const CategoryNotesModal = ({ isOpen, onClose, category, notes, onSelectNote }) => {
    if (!isOpen || !category) return null;

    // Filter notes for this category
    const categoryNotes = notes.filter(note => note.categoryId === category.id);

    return (
        <div className="modal-overlay show" onClick={onClose}>
            <div className="modal-content category-notes-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>📂 {category.name}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {categoryNotes.length > 0 ? (
                        <ul className="category-notes-list">
                            {categoryNotes.map(note => (
                                <li key={note.id} onClick={() => onSelectNote(note)} className="category-note-item">
                                    <span className="note-icon">📝</span>
                                    <span className="note-title">{note.title || 'Không có tiêu đề'}</span>
                                    {note.isImportant && <span className="note-star">⭐</span>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-state">Chưa có ghi chú nào trong danh mục này.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryNotesModal;
