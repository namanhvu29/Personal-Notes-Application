import React from 'react';

const SlashMenu = ({ isOpen, position, onSelect, onClose }) => {
    if (!isOpen) return null;

    const options = [
        // { type: 'text', label: '📝 Text', prefix: '' },
        { type: 'h1', label: '# Heading 1', prefix: '# ' },
        { type: 'h2', label: '## Heading 2', prefix: '## ' },
        { type: 'bullet', label: '• Bullet List', prefix: '* ' },
        { type: 'number', label: '1. Number List', prefix: '1. ' },
        { type: 'todo', label: '✓ To Do List', prefix: '- [ ] ' },
        { type: 'image', label: '🖼️ Image', prefix: '' },
        { type: 'file', label: '📎 File', prefix: '' },
        { type: 'separator', label: '--- Separator', prefix: '\n---\n' },
    ];

    return (
        <div
            className="slash-menu-container show"
            style={{
                top: position.top,
                left: position.left,
                position: 'absolute',
                zIndex: 1000
            }}
        >
            <div className="menu-title">BASIC BLOCKS</div>
            <ul id="slashList">
                {options.map(option => (
                    <li
                        key={option.type}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => onSelect(option.type)}
                        style={{ cursor: 'pointer' }}
                    >
                        {option.label}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SlashMenu;
