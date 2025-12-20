
const API_BASE = 'http://localhost:8080/foundation/api/admin';
const USER_API_BASE = 'http://localhost:8080/foundation/users';

const navLinks = document.querySelectorAll('.nav-link');
const pages = {
    'dashboard': document.getElementById('dashboard-page'),
    'notes': document.getElementById('notes-page'),
    'settings': document.getElementById('settings-page')
};

navLinks.forEach(link => {
    link.addEventListener('click', function() {
        const pageName = this.getAttribute('data-page');
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        Object.keys(pages).forEach(key => {
            pages[key].classList.toggle('hidden', key !== pageName);
        });
    });
});

// Hàm xử lý Toggle Switch (Công tắc)
function toggleSetting(element) {
    element.classList.toggle('active');
}

// Helper: Lấy giá trị của Toggle (True/False)
function getToggleState(element) {
    return element.classList.contains('active') ? "true" : "false";
}

// Helper: Set trạng thái cho Toggle dựa trên dữ liệu server
function setToggleState(element, value) {
    if (value === "true") element.classList.add('active');
    else element.classList.remove('active');
}
async function fetchDashboardStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        if (!response.ok) return;
        const data = await response.json();
        document.getElementById('total-users').textContent = data.totalUsers;
        document.getElementById('total-notes').textContent = data.totalNotes;
    } catch (e) { 
        console.error("Lỗi lấy thống kê:", e); 
    }
}

async function fetchNotesList() {
    try {
        const response = await fetch(`${API_BASE}/notes`);
        if (!response.ok) return;
        const data = await response.json();
        const notesContainer = document.getElementById('notes-list');
        notesContainer.innerHTML = '';

        if (data.length > 0) {
            data.forEach(note => {
                const dateStr = new Date(note.createdAt).toLocaleDateString('vi-VN');
                const authorName = note.createdBy || "Unknown";
                const html = `
                    <div class="note-item" data-id="${note.noteId}">
                        <div class="note-content">
                            <div class="avatar">${authorName.charAt(0).toUpperCase()}</div>
                            <div class="note-info">
                                <div class="note-title">${note.title}</div>
                                <div class="note-meta">${authorName} | ${dateStr}</div>
                            </div>
                        </div>
                        <div class="note-actions">
                            <button class="icon-btn delete" onclick="deleteNote(${note.noteId})">🗑️</button>
                        </div>
                    </div>`;
                notesContainer.innerHTML += html;
            });
        } else {
            notesContainer.innerHTML = '<div class="empty-notes">No notes found</div>';
        }
    } catch (e) { console.error(e); }
}

async function fetchAdminLogs() {
    try {
        const response = await fetch(`${API_BASE}/logs`);
        if (!response.ok) return;
        const data = await response.json();
        const logContainer = document.getElementById('admin-log-list');
        logContainer.innerHTML = '';
        data.forEach(log => {
            const time = new Date(log.timestamp).toLocaleTimeString();
            logContainer.innerHTML += `
                <div class="log-item">
                    <div class="avatar">A</div>
                    <div class="log-text">${log.action} - ${time}</div>
                </div>`;
        });
    } catch (e) { console.error(e); }
}

async function deleteNote(id) {
    if(!confirm("Xóa ghi chú này?")) return;
    try {
        await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' });
        document.querySelector(`.note-item[data-id="${id}"]`).remove();
        fetchDashboardStats();
        fetchAdminLogs();
    } catch (e) { alert("Lỗi xóa note"); }
}

// 1. Tải toàn bộ cài đặt khi mở trang
async function loadAllSettings() {
    try {
        const response = await fetch(`${API_BASE}/settings`);
        if (!response.ok) return;
        const s = await response.json(); // s = settings object

        // Helper điền dữ liệu
        const setVal = (id, key) => {
            const el = document.getElementById(id);
            if (el && s[key] !== undefined) el.value = s[key];
        };
        const setTog = (containerSelector, key) => {
        };

        // --- System ---
        setVal('site-name', 'site_name');
        setVal('default-language', 'language');
        setVal('timezone', 'timezone');
        // Toggle Maintenance
        const maintToggle = document.querySelector('#settings-page .settings-section:nth-child(2) .toggle-switch');
        if(maintToggle && s['maintenance_mode']) setToggleState(maintToggle, s['maintenance_mode']);

        // --- User Management ---
        setVal('max-notes', 'max_notes');
        setVal('storage-limit', 'storage_limit');
        // Toggles (Public Reg & Email Verify)
        const userSection = document.querySelector('#settings-page .settings-section:nth-child(3)');
        if(userSection) {
            const toggles = userSection.querySelectorAll('.toggle-switch');
            if(toggles[0] && s['public_registration']) setToggleState(toggles[0], s['public_registration']);
            if(toggles[1] && s['email_verification']) setToggleState(toggles[1], s['email_verification']);
        }

        // --- Security ---
        setVal('min-password', 'min_password');
        setVal('session-timeout', 'session_timeout');
        setVal('max-login', 'max_login_attempts');
        setVal('log-retention', 'log_retention');

        // --- Email ---
        setVal('smtp-server', 'smtp_server');
        setVal('smtp-port', 'smtp_port');
        const emailToggle = document.querySelector('#settings-page .settings-section:nth-child(5) .toggle-switch');
        if(emailToggle && s['email_notifications']) setToggleState(emailToggle, s['email_notifications']);

        // --- Backup & API ---
        setVal('backup-frequency', 'backup_frequency');
        setVal('data-retention', 'data_retention');
        setVal('rate-limit', 'rate_limit');
        
        // --- Appearance ---
        setVal('theme', 'theme');
        setVal('date-format', 'date_format');

    } catch (e) { console.error("Lỗi load settings:", e); }
}

// Hàm chung để lưu settings
async function saveConfig(payload, msg) {
    try {
        const res = await fetch(`${API_BASE}/settings`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        if(res.ok) alert(msg || "Lưu thành công!");
        else alert("Lỗi khi lưu!");
    } catch(e) { alert("Lỗi kết nối server"); }
}

// 2. Các hàm Save chi tiết (Gắn vào nút onclick trong HTML)

function saveSystemSettings() {
    const section = document.querySelector('#settings-page .settings-section:nth-child(2)');
    const payload = {
        "site_name": document.getElementById('site-name').value,
        "language": document.getElementById('default-language').value,
        "timezone": document.getElementById('timezone').value,
        "maintenance_mode": getToggleState(section.querySelector('.toggle-switch'))
    };
    saveConfig(payload, "Đã lưu cấu hình hệ thống!");
}

function saveUserSettings() {
    const section = document.querySelector('#settings-page .settings-section:nth-child(3)');
    const toggles = section.querySelectorAll('.toggle-switch');
    const payload = {
        "public_registration": getToggleState(toggles[0]),
        "email_verification": getToggleState(toggles[1]),
        "max_notes": document.getElementById('max-notes').value,
        "storage_limit": document.getElementById('storage-limit').value
    };
    saveConfig(payload, "Đã lưu cấu hình người dùng!");
}

function saveSecuritySettings() {
    const payload = {
        "min_password": document.getElementById('min-password').value,
        "session_timeout": document.getElementById('session-timeout').value,
        "max_login_attempts": document.getElementById('max-login').value,
        "log_retention": document.getElementById('log-retention').value
    };
    saveConfig(payload, "Đã lưu cấu hình bảo mật!");
}

function saveEmailSettings() {
    const section = document.querySelector('#settings-page .settings-section:nth-child(5)');
    const payload = {
        "smtp_server": document.getElementById('smtp-server').value,
        "smtp_port": document.getElementById('smtp-port').value,
        "email_notifications": getToggleState(section.querySelector('.toggle-switch'))
    };
    saveConfig(payload, "Đã lưu cấu hình Email!");
}

function saveBackupSettings() {
    const section = document.querySelector('#settings-page .settings-section:nth-child(6)');
    const payload = {
        "auto_backup": getToggleState(section.querySelector('.toggle-switch')),
        "backup_frequency": document.getElementById('backup-frequency').value,
        "data_retention": document.getElementById('data-retention').value
    };
    saveConfig(payload, "Đã lưu cấu hình Backup!");
}

function saveApiSettings() {
    const section = document.querySelector('#settings-page .settings-section:nth-child(7)');
    const payload = {
        "api_enabled": getToggleState(section.querySelector('.toggle-switch')),
        "rate_limit": document.getElementById('rate-limit').value
    };
    saveConfig(payload, "Đã lưu cấu hình API!");
}

function saveAppearanceSettings() {
    const payload = {
        "theme": document.getElementById('theme').value,
        "date_format": document.getElementById('date-format').value
    };
    saveConfig(payload, "Đã lưu cấu hình giao diện!");
}

// Account Settings (Logic cũ - Cần ID thật)
async function saveAccountSettings() {
    // Demo update user ID 1
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-password').value;
    try {
        await fetch(`${USER_API_BASE}/1`, {
            method: 'PUT',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({email: email, password: pass})
        });
        alert("Cập nhật tài khoản Admin thành công!");
    } catch(e) { alert("Lỗi cập nhật user"); }
}

// Các nút giả lập (chưa có logic backend thực tế)
function testEmail() { alert("Đã gửi email test giả lập!"); }
function createBackup() { alert("Đang tạo bản sao lưu..."); }
function exportData() { alert("Đang xuất dữ liệu..."); }
function regenerateApiKey() { alert("API Key mới: " + Math.random().toString(36).substring(7)); }
function handleLogout() { window.location.href = '/login'; }


window.addEventListener('DOMContentLoaded', () => {
    fetchDashboardStats();
    fetchNotesList();
    fetchAdminLogs();
    loadAllSettings();
});

