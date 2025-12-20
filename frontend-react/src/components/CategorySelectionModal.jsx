import React, { useState } from 'react';

const CategorySelectionModal = ({
    isOpen,
    onClose,
    categories,
    onSelectCategory,
    onAddCategory,
    onRenameCategory,
    onDeleteCategory
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    if (!isOpen) return null;

    const handleAddSubmit = (e) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            // We need to adapt the onAddCategory from DashboardPage which uses prompt
            // But here we want to pass the name directly. 
            // Since DashboardPage's handleAddCategory uses prompt, we might need to refactor it 
            // OR we can just mock the behavior here if we can't change DashboardPage easily right now.
            // Wait, I can't change DashboardPage's logic easily without changing Sidebar too.
            // Let's assume for now I should modify DashboardPage to accept an argument.

            // Actually, let's look at DashboardPage again. 
            // handleAddCategory takes no args and calls prompt.
            // I should probably update DashboardPage to optionally take a name.
            // But for now, let's just use the prop as is, but wait... 
            // If I call onAddCategory(), it will pop up a prompt. That's not what we want for "Beautiful UI".

            // CRITICAL: I need to update DashboardPage handlers to accept arguments!
            // But I already updated DashboardPage to pass them.
            // Let's pause and update DashboardPage handlers first to be more flexible.

            // For now, I will implement the UI and then fix the handlers in the next step.
            // I'll assume onAddCategory(name) works.
            onAddCategory(newCategoryName);
            setNewCategoryName('');
            setIsAdding(false);
        }
    };

    const startEdit = (e, cat) => {
        e.stopPropagation();
        setEditingId(cat.id);
        setEditName(cat.name);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (editName.trim()) {
            onRenameCategory(editingId, editName);
            setEditingId(null);
        }
    };

    const handleDelete = (e, cat) => {
        e.stopPropagation();
        onDeleteCategory(cat.id, cat.name);
    };

    return (
        <div className="modal-overlay show" onClick={onClose}>
            <div className="modal-content category-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Quản lý danh mục</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <ul className="category-list-modal">
                        {categories && categories.length > 0 ? (
                            categories.map(cat => (
                                <li key={cat.id} onClick={() => onSelectCategory(cat.id)} className="category-item">
                                    {editingId === cat.id ? (
                                        <form onSubmit={handleEditSubmit} className="edit-category-form" onClick={e => e.stopPropagation()}>
                                            <input
                                                autoFocus
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                onBlur={() => setEditingId(null)}
                                                className="edit-category-input"
                                            />
                                        </form>
                                    ) : (
                                        <>
                                            <div className="category-info">
                                                <span className="category-icon">🏷️</span>
                                                <span className="category-name">{cat.name}</span>
                                            </div>
                                            <div className="category-actions">
                                                <button
                                                    className="icon-btn edit-btn"
                                                    onClick={(e) => startEdit(e, cat)}
                                                    title="Đổi tên"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="icon-btn delete-btn"
                                                    onClick={(e) => handleDelete(e, cat)}
                                                    title="Xóa"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))
                        ) : (
                            <p className="empty-state">Chưa có danh mục nào.</p>
                        )}
                    </ul>

                    {isAdding ? (
                        <form onSubmit={handleAddSubmit} className="add-category-form">
                            <input
                                autoFocus
                                placeholder="Tên danh mục mới..."
                                value={newCategoryName}
                                onChange={e => setNewCategoryName(e.target.value)}
                                className="add-category-input"
                            />
                            <div className="add-actions">
                                <button type="submit" className="confirm-btn">Thêm</button>
                                <button type="button" onClick={() => setIsAdding(false)} className="cancel-btn">Hủy</button>
                            </div>
                        </form>
                    ) : (
                        <button className="add-category-btn-modal" onClick={() => setIsAdding(true)}>
                            + Thêm danh mục mới
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategorySelectionModal;
