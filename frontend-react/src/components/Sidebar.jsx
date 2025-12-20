
import React, { useState } from 'react';

const Sidebar = ({
    notes,
    onSelectNote,
    onAddNote,
    categories,
    onAddCategory,
    onRenameCategory,
    onDeleteCategory,
    onLogout,
    onOpenTrash,

    searchQuery,
    onSearch,
    selectedCategory,
    onSelectCategory
}) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <aside className="sidebar">
            <div className="search-wrapper" id="searchWrapper">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    id="searchBox"
                    placeholder="Tìm kiếm ghi chú..."
                    className="search-box"
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>

            {/* Search Results Mode - Overlay */}
            {searchQuery && (
                <div id="searchResultsContainer" className="search-results-container show" style={{ display: 'block' }}>
                    <ul id="searchResultsList" className="search-results-list">
                        {notes.length === 0 ? (
                            <li style={{ color: '#999' }}>Không tìm thấy.</li>
                        ) : (
                            notes.map(note => (
                                <li key={note.id} onClick={() => { onSelectNote(note); onSearch(''); }}>
                                    {note.title || 'Untitled'}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

            {/* Normal Mode - Always Rendered */}
            <div className="sections">

                <section className="important-section">
                    <h3>⭐ Quan trọng</h3>
                    <ul id="importantList">
                        {/* Filter important notes */}
                        {notes.filter(n => n.isImportant).map(note => (
                            <li key={note.id} onClick={() => onSelectNote(note)}>
                                {note.title || 'Không có tiêu đề'}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="notes-section">
                    <div className="notes-header" onClick={() => onSelectCategory(null)} style={{ cursor: 'pointer' }}>
                        <h3>📝 Ghi chú {selectedCategory ? '(Tất cả)' : ''}</h3>
                        <button id="addNoteBtn" title="Tạo ghi chú mới" onClick={(e) => { e.stopPropagation(); onAddNote(); }}>+</button>
                    </div>
                    <ul id="notesList">
                        {notes.map(note => (
                            <li key={note.id} onClick={() => onSelectNote(note)}>
                                {note.title || 'Không có tiêu đề'}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="category-section">
                    <div className="category-header">
                        <h3>🏷️ Danh mục</h3>
                        <button id="addCategoryBtn" title="Thêm danh mục mới" onClick={onAddCategory}>+</button>
                    </div>
                    <ul id="categoryList">
                        {categories.map(cat => (
                            <li
                                key={cat.id}
                                className={`category-item ${selectedCategory && selectedCategory.id === cat.id ? 'selected' : ''}`}
                                onClick={() => onSelectCategory(cat)}
                                style={{ backgroundColor: selectedCategory && selectedCategory.id === cat.id ? '#ffeb99' : 'transparent', cursor: 'pointer' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <span
                                        className="category-name"
                                        onDoubleClick={(e) => { e.stopPropagation(); onRenameCategory(cat.id, cat.name); }}
                                        title="Double click to rename"
                                    >
                                        {cat.name}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDeleteCategory(cat.id, cat.name); }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            <div className="settings">
                <button className="settings-btn" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>⚙️</button>
                <div className={`settings-menu ${isSettingsOpen ? 'show' : ''}`} style={{ display: isSettingsOpen ? 'block' : 'none' }}>
                    <button id="profileBtn">👤 Hồ sơ</button>
                    <button id="openTrashBtn" onClick={() => { onOpenTrash(); setIsSettingsOpen(false); }}>🗑️ Thùng rác</button>
                    <button id="logoutBtn" onClick={onLogout}>🚪 Đăng xuất</button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
