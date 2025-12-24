import React, { useState } from 'react';

const Sidebar = ({
    activeTab,
    onTabChange,
    notes,           // Cần nhận notes để lọc mục quan trọng
    onSelectNote,    // Cần hàm này để nhấn vào note quan trọng là mở luôn
    onLogout,
    onOpenTrash,
    searchQuery,
    onSearch
}) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <aside className="sidebar">
            <div className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="search-box"
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>

            {/* Search Results Dropdown */}
            {searchQuery && (
                <div className="search-results-container show">
                    {notes.length > 0 ? (
                        <ul id="notesList">
                            {notes.map(note => (
                                <li key={note.id} onClick={() => onSelectNote(note)}>
                                    {note.title || 'Không có tiêu đề'}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div style={{ padding: '10px', color: '#888', textAlign: 'center' }}>
                            Không tìm thấy kết quả
                        </div>
                    )}
                </div>
            )}

            <div className="sections">
                {/* PHẦN QUAN TRỌNG NHƯ CŨ */}
                <section className="important-section">
                    <h3>⭐ Quan trọng</h3>
                    <ul id="importantList">
                        {notes.filter(n => n.isImportant).map(note => (
                            <li key={note.id} onClick={() => onSelectNote(note)}>
                                {note.title || 'Không có tiêu đề'}
                            </li>
                        ))}
                    </ul>
                </section>

                <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid #eee' }} />

                {/* CÁC TAB CHO PHẦN CÒN LẠI */}
                <div
                    className={`sidebar-tab-item ${activeTab === 'notes' ? 'active' : ''}`}
                    onClick={() => onTabChange('notes')}
                >
                    <span className="icon">📝</span> Ghi chú
                </div>

                <div
                    className={`sidebar-tab-item ${activeTab === 'categories' ? 'active' : ''}`}
                    onClick={() => onTabChange('categories')}
                >
                    <span className="icon">🏷️</span> Danh mục
                </div>
            </div>

            <div className="settings">
                <button className="settings-btn" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>⚙️</button>
                <div className={`settings-menu ${isSettingsOpen ? 'show' : ''}`}>
                    <button onClick={onOpenTrash}>🗑️ Thùng rác</button>
                    <button onClick={onLogout}>🚪 Đăng xuất</button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;