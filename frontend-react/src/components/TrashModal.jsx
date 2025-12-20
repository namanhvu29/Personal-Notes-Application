import React from 'react';

const TrashModal = ({ isOpen, onClose, trashItems, onRestore, onDeletePermanent, onEmptyTrash }) => {
    if (!isOpen) return null;

    return (
        <div id="trashModal" className="modal-overlay show">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>🗑️ Thùng rác</h3>
                    <button id="closeModalBtn" className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <ul id="trashList" className="modal-trash-list">
                    {trashItems.length === 0 ? (
                        <li style={{ color: '#999' }}>Thùng rác trống</li>
                    ) : (
                        trashItems.map((item, index) => (
                            <li key={index} className="trash-item">
                                <div className="trash-item-container">
                                    <span>[{item.type === 'note' ? 'NOTE' : 'CAT'}] {item.data.title || item.data.name || "Mục không tên"}</span>
                                </div>
                                <div className="trash-item-actions">
                                    <button className="restore-btn" onClick={() => onRestore(index)}>↩️ Phục hồi</button>
                                    <button className="delete-perm-btn" onClick={() => onDeletePermanent(index)}>❌ Xóa</button>
                                </div>
                            </li>
                        ))
                    )}
                </ul>

                {trashItems.length > 0 && (
                    <button id="emptyTrashAllBtn" className="empty-trash-btn" onClick={onEmptyTrash}>🗑️ Xóa Vĩnh Viễn Tất Cả</button>
                )}
            </div>
        </div>
    );
};

export default TrashModal;
