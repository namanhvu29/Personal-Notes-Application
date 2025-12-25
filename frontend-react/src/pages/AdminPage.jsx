import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/admin.css';

const AdminPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalNotes, setTotalNotes] = useState(0);
    const [storageUsed, setStorageUsed] = useState(0);
    const [storageTotal, setStorageTotal] = useState(10240); // 10GB in MB
    const [adminLogs, setAdminLogs] = useState([]);
    const [notes, setNotes] = useState([]);

    // Settings State
    const [adminName, setAdminName] = useState('Administrator');
    const [adminEmail, setAdminEmail] = useState('admin@noteflow.com');
    const [adminPassword, setAdminPassword] = useState('');
    const [siteName, setSiteName] = useState('NoteFlow');
    const [defaultLanguage, setDefaultLanguage] = useState('en');
    const [timezone, setTimezone] = useState('UTC');
    const [maxNotes, setMaxNotes] = useState(100);
    const [storageLimit, setStorageLimit] = useState(500);
    const [minPassword, setMinPassword] = useState(8);
    const [sessionTimeout, setSessionTimeout] = useState(30);
    const [maxLogin, setMaxLogin] = useState(5);
    const [logRetention, setLogRetention] = useState(90);
    const [smtpServer, setSmtpServer] = useState('');
    const [smtpPort, setSmtpPort] = useState(587);
    const [backupFrequency, setBackupFrequency] = useState('daily');
    const [dataRetention, setDataRetention] = useState(30);
    const [rateLimit, setRateLimit] = useState(1000);
    const [theme, setTheme] = useState('light');
    const [dateFormat, setDateFormat] = useState('dd.mm.yy');

    // Toggles
    const [twoFactor, setTwoFactor] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [publicRegistration, setPublicRegistration] = useState(true);
    const [emailVerification, setEmailVerification] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [autoBackup, setAutoBackup] = useState(true);
    const [apiEnabled, setApiEnabled] = useState(true);

    useEffect(() => {
        // Load initial statistics
        setTotalUsers(0);
        setTotalNotes(0);
        setStorageUsed(0);
        setAdminLogs([]);
        setNotes([]);
    }, []);

    const handleLogout = () => {
        navigate('/login');
    };

    const toggleSetting = (setter, value) => {
        setter(!value);
    };

    // Helper to format storage
    const formatStorage = (used, total) => {
        let usedDisplay, totalDisplay, unit;
        if (total >= 1024) {
            usedDisplay = (used / 1024).toFixed(2);
            totalDisplay = (total / 1024).toFixed(2);
            unit = 'GB';
        } else {
            usedDisplay = used.toFixed(2);
            totalDisplay = total.toFixed(2);
            unit = 'MB';
        }
        return { usedDisplay, totalDisplay, unit };
    };

    const { usedDisplay, totalDisplay, unit } = formatStorage(storageUsed, storageTotal);
    const storagePercentage = storageTotal > 0 ? (storageUsed / storageTotal) * 100 : 0;

    // Settings Save Handlers
    const saveAccountSettings = () => {
        console.log('Saving account settings:', { adminName, adminEmail, adminPassword });
        alert('Account settings saved successfully!');
    };

    const saveSystemSettings = () => {
        console.log('Saving system settings:', { siteName, defaultLanguage, timezone });
        alert('System settings saved successfully!');
    };

    const saveUserSettings = () => {
        console.log('Saving user settings:', { maxNotes, storageLimit });
        alert('User management settings saved successfully!');
    };

    const saveSecuritySettings = () => {
        console.log('Saving security settings:', { minPassword, sessionTimeout, maxLogin, logRetention });
        alert('Security settings saved successfully!');
    };

    const saveEmailSettings = () => {
        console.log('Saving email settings:', { smtpServer, smtpPort });
        alert('Email settings saved successfully!');
    };

    const testEmail = () => {
        alert('Test email sent! Check your inbox.');
    };

    const saveBackupSettings = () => {
        console.log('Saving backup settings:', { backupFrequency, dataRetention });
        alert('Backup settings saved successfully!');
    };

    const createBackup = () => {
        alert('Creating backup... This may take a few moments.');
        setTimeout(() => {
            alert('Backup created successfully!');
        }, 2000);
    };

    const exportData = () => {
        alert('Exporting data... Download will start shortly.');
        setTimeout(() => {
            alert('Data exported successfully!');
        }, 2000);
    };

    const saveApiSettings = () => {
        console.log('Saving API settings:', { rateLimit });
        alert('API settings saved successfully!');
    };

    const regenerateApiKey = () => {
        if (window.confirm('Are you sure you want to regenerate the API key? This will invalidate the current key.')) {
            alert('New API key generated: ' + Math.random().toString(36).substring(2, 15));
        }
    };

    const saveAppearanceSettings = () => {
        console.log('Saving appearance settings:', { theme, dateFormat });
        alert('Appearance settings saved successfully!');
    };

    const deleteNote = (id) => {
        setNotes(notes.filter(note => note.id !== id));
    };

    return (
        <div className="admin-body">
            {/* Browser Bar */}
            <div className="browser-bar">
                <div className="browser-dot dot-red"></div>
                <div className="browser-dot dot-yellow"></div>
                <div className="browser-dot dot-green"></div>
            </div>

            {/* Header */}
            <header>
                <div className="header-container">
                    <div className="logo">
                        <div className="logo-icon">☁</div>
                        <h1>NoteFlow Admin</h1>
                    </div>

                    <nav>
                        <button
                            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            Dashboard
                        </button>
                        <button
                            className={`nav-link ${activeTab === 'notes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('notes')}
                        >
                            Notes
                        </button>
                        <button
                            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            Settings
                        </button>
                    </nav>

                    <button className="logout-btn" onClick={handleLogout}>
                        <span>👤</span>
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main>
                {/* Dashboard Page */}
                {activeTab === 'dashboard' && (
                    <div id="dashboard-page">
                        <h2 className="page-title">Dashboard Overview</h2>

                        {/* Statistics */}
                        <div className="stats-grid">
                            <div className="stat-card blue">
                                <div className="stat-label">Total Users</div>
                                <div className="stat-value">{totalUsers.toLocaleString()}</div>
                            </div>

                            <div className="stat-card green">
                                <div className="stat-label">Total Notes</div>
                                <div className="stat-value">{totalNotes.toLocaleString()}</div>
                            </div>

                            <div className="stat-card gray">
                                <div className="stat-label">Storage Used</div>
                                <div className="stat-value" style={{ fontSize: '28px' }}>{usedDisplay} {unit}</div>
                                <div style={{ marginTop: '12px' }}>
                                    <div style={{ backgroundColor: '#e5e7eb', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                backgroundColor: storagePercentage >= 90 ? '#ef4444' : storagePercentage >= 75 ? '#f59e0b' : '#3b82f6',
                                                height: '100%',
                                                width: `${storagePercentage}%`,
                                                transition: 'width 0.3s'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Grid */}
                        <div className="dashboard-grid">
                            {/* Note Management */}
                            <div className="card">
                                <h3 className="card-title">Note Management</h3>
                                <div id="notes-list">
                                    {notes.length > 0 ? notes.map(note => (
                                        <div key={note.id} className="note-item">
                                            <div className="note-content">
                                                <div className="avatar">U</div>
                                                <div className="note-info">
                                                    <div className="note-title">{note.title}</div>
                                                    <div className="note-meta">{note.author} | {note.date}</div>
                                                </div>
                                            </div>
                                            <div className="note-actions">
                                                <button className="icon-btn">🔍</button>
                                                <button className="icon-btn delete" onClick={() => deleteNote(note.id)}>🗑️</button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="empty-notes">No notes available</div>
                                    )}
                                </div>
                            </div>

                            {/* Admin History Log */}
                            <div className="card">
                                <h3 className="card-title">Admin History Log</h3>
                                <div id="admin-log-list">
                                    {adminLogs.length > 0 ? adminLogs.map((log, index) => (
                                        <div key={index} className="log-item">
                                            <div className="avatar">U</div>
                                            <div className="log-text">{log}</div>
                                        </div>
                                    )) : (
                                        <div className="empty-log">No admin activities recorded</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notes Page */}
                {activeTab === 'notes' && (
                    <div id="notes-page">
                        <h2 className="page-title">Notes Management</h2>
                        <div className="empty-page">
                            <p>Notes management page - Coming soon</p>
                        </div>
                    </div>
                )}

                {/* Settings Page */}
                {activeTab === 'settings' && (
                    <div id="settings-page">
                        <h2 className="page-title">Settings</h2>
                        <div className="settings-container">

                            {/* Account Settings */}
                            <div className="settings-section">
                                <h3>Account Settings</h3>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Admin Name</div>
                                        <div className="setting-description">Update your display name</div>
                                    </div>
                                    <div className="setting-control">
                                        <input
                                            type="text"
                                            placeholder="Admin Name"
                                            value={adminName}
                                            onChange={(e) => setAdminName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Email Address</div>
                                        <div className="setting-description">Your admin email address</div>
                                    </div>
                                    <div className="setting-control">
                                        <input
                                            type="email"
                                            placeholder="admin@example.com"
                                            value={adminEmail}
                                            onChange={(e) => setAdminEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Change Password</div>
                                        <div className="setting-description">Update your account password</div>
                                    </div>
                                    <div className="setting-control">
                                        <input
                                            type="password"
                                            placeholder="New password"
                                            value={adminPassword}
                                            onChange={(e) => setAdminPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Two-Factor Authentication</div>
                                        <div className="setting-description">Enable 2FA for extra security</div>
                                    </div>
                                    <div className="setting-control">
                                        <div
                                            className={`toggle-switch ${twoFactor ? 'active' : ''}`}
                                            onClick={() => toggleSetting(setTwoFactor, twoFactor)}
                                        >
                                            <div className="toggle-slider"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="setting-buttons">
                                    <button className="btn-primary" onClick={saveAccountSettings}>Save Changes</button>
                                </div>
                            </div>

                            {/* System Configuration */}
                            <div className="settings-section">
                                <h3>System Configuration</h3>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Site Name</div>
                                        <div className="setting-description">Your application name</div>
                                    </div>
                                    <div className="setting-control">
                                        <input
                                            type="text"
                                            placeholder="Site Name"
                                            value={siteName}
                                            onChange={(e) => setSiteName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Default Language</div>
                                        <div className="setting-description">System default language</div>
                                    </div>
                                    <div className="setting-control">
                                        <select value={defaultLanguage} onChange={(e) => setDefaultLanguage(e.target.value)}>
                                            <option value="en">English</option>
                                            <option value="vi">Vietnamese</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Timezone</div>
                                        <div className="setting-description">Default timezone for the system</div>
                                    </div>
                                    <div className="setting-control">
                                        <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                                            <option value="UTC">UTC</option>
                                            <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh</option>
                                            <option value="America/New_York">America/New York</option>
                                            <option value="Europe/London">Europe/London</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Maintenance Mode</div>
                                        <div className="setting-description">Put site in maintenance mode</div>
                                    </div>
                                    <div className="setting-control">
                                        <div
                                            className={`toggle-switch ${maintenanceMode ? 'active' : ''}`}
                                            onClick={() => toggleSetting(setMaintenanceMode, maintenanceMode)}
                                        >
                                            <div className="toggle-slider"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="setting-buttons">
                                    <button className="btn-primary" onClick={saveSystemSettings}>Save Changes</button>
                                </div>
                            </div>

                            {/* User Management Settings */}
                            <div className="settings-section">
                                <h3>User Management Settings</h3>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Public Registration</div>
                                        <div className="setting-description">Allow new users to register</div>
                                    </div>
                                    <div className="setting-control">
                                        <div
                                            className={`toggle-switch ${publicRegistration ? 'active' : ''}`}
                                            onClick={() => toggleSetting(setPublicRegistration, publicRegistration)}
                                        >
                                            <div className="toggle-slider"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Email Verification</div>
                                        <div className="setting-description">Require email verification for new accounts</div>
                                    </div>
                                    <div className="setting-control">
                                        <div
                                            className={`toggle-switch ${emailVerification ? 'active' : ''}`}
                                            onClick={() => toggleSetting(setEmailVerification, emailVerification)}
                                        >
                                            <div className="toggle-slider"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Max Notes Per User</div>
                                        <div className="setting-description">Maximum number of notes per user (0 = unlimited)</div>
                                    </div>
                                    <div className="setting-control">
                                        <input
                                            type="number"
                                            value={maxNotes}
                                            min="0"
                                            onChange={(e) => setMaxNotes(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Storage Limit Per User (MB)</div>
                                        <div className="setting-description">Maximum storage per user in megabytes</div>
                                    </div>
                                    <div className="setting-control">
                                        <input
                                            type="number"
                                            value={storageLimit}
                                            min="0"
                                            onChange={(e) => setStorageLimit(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="setting-buttons">
                                    <button className="btn-primary" onClick={saveUserSettings}>Save Changes</button>
                                </div>
                            </div>

                            {/* Security Settings */}
                            <div className="settings-section">
                                <h3>Security Settings</h3>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Minimum Password Length</div>
                                        <div className="setting-description">Minimum characters required for passwords</div>
                                    </div>
                                    <div className="setting-control">
                                        <input
                                            type="number"
                                            value={minPassword}
                                            min="4"
                                            onChange={(e) => setMinPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Session Timeout (minutes)</div>
                                        <div className="setting-description">Auto logout after inactivity</div>
                                    </div>
                                    <div className="setting-control">
                                        <input
                                            type="number"
                                            value={sessionTimeout}
                                            min="5"
                                            onChange={(e) => setSessionTimeout(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Max Login Attempts</div>
                                        <div className="setting-description">Lock account after failed attempts</div>
                                    </div>
                                    <div className="setting-control">
                                        <input
                                            type="number"
                                            value={maxLogin}
                                            min="3"
                                            onChange={(e) => setMaxLogin(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Security Logs Retention (days)</div>
                                        <div className="setting-description">Keep security logs for specified days</div>
                                    </div>
                                    <div className="setting-control">
                                        <input
                                            type="number"
                                            value={logRetention}
                                            min="7"
                                            onChange={(e) => setLogRetention(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="setting-buttons">
                                    <button className="btn-primary" onClick={saveSecuritySettings}>Save Changes</button>
                                </div>
                            </div>

                            {/* Email Settings */}
                            <div className="settings-section">
                                <h3>Email Settings</h3>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">SMTP Server</div>
                                        <div className="setting-description">SMTP server address</div>
                                    </div>
                                    <div className="setting-control">
                                        <input
                                            type="text"
                                            placeholder="smtp.gmail.com"
                                            value={smtpServer}
                                            onChange={(e) => setSmtpServer(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">SMTP Port</div>
                                        <div className="setting-description">SMTP server port</div>
                                    </div>
                                    <div className="setting-control">
                                        <input
                                            type="number"
                                            value={smtpPort}
                                            onChange={(e) => setSmtpPort(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Email Notifications</div>
                                        <div className="setting-description">Send email notifications to users</div>
                                    </div>
                                    <div className="setting-control">
                                        <div
                                            className={`toggle-switch ${emailNotifications ? 'active' : ''}`}
                                            onClick={() => toggleSetting(setEmailNotifications, emailNotifications)}
                                        >
                                            <div className="toggle-slider"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="setting-buttons">
                                    <button className="btn-primary" onClick={saveEmailSettings}>Save Changes</button>
                                    <button className="btn-secondary" onClick={testEmail}>Send Test Email</button>
                                </div>
                            </div>

                            {/* Backup & Data */}
                            <div className="settings-section">
                                <h3>Backup & Data</h3>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Automatic Backup</div>
                                        <div className="setting-description">Enable automatic database backups</div>
                                    </div>
                                    <div className="setting-control">
                                        <div
                                            className={`toggle-switch ${autoBackup ? 'active' : ''}`}
                                            onClick={() => toggleSetting(setAutoBackup, autoBackup)}
                                        >
                                            <div className="toggle-slider"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Backup Frequency</div>
                                        <div className="setting-description">How often to backup</div>
                                    </div>
                                    <div className="setting-control">
                                        <select value={backupFrequency} onChange={(e) => setBackupFrequency(e.target.value)}>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Data Retention (days)</div>
                                        <div className="setting-description">Keep deleted items for specified days</div>
                                    </div>
                                    <div className="setting-control">
                                        <input
                                            type="number"
                                            value={dataRetention}
                                            min="0"
                                            onChange={(e) => setDataRetention(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="setting-buttons">
                                    <button className="btn-primary" onClick={saveBackupSettings}>Save Changes</button>
                                    <button className="btn-secondary" onClick={createBackup}>Create Backup Now</button>
                                    <button className="btn-secondary" onClick={exportData}>Export All Data</button>
                                </div>
                            </div>

                            {/* API Settings */}
                            <div className="settings-section">
                                <h3>API Settings</h3>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">API Enabled</div>
                                        <div className="setting-description">Enable API access</div>
                                    </div>
                                    <div className="setting-control">
                                        <div
                                            className={`toggle-switch ${apiEnabled ? 'active' : ''}`}
                                            onClick={() => toggleSetting(setApiEnabled, apiEnabled)}
                                        >
                                            <div className="toggle-slider"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Rate Limit (requests/hour)</div>
                                        <div className="setting-description">Maximum API requests per hour</div>
                                    </div>
                                    <div className="setting-control">
                                        <input
                                            type="number"
                                            value={rateLimit}
                                            min="100"
                                            onChange={(e) => setRateLimit(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="setting-buttons">
                                    <button className="btn-primary" onClick={saveApiSettings}>Save Changes</button>
                                    <button className="btn-secondary" onClick={regenerateApiKey}>Regenerate API Key</button>
                                </div>
                            </div>

                            {/* Appearance */}
                            <div className="settings-section">
                                <h3>Appearance</h3>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Theme</div>
                                        <div className="setting-description">Choose your preferred theme</div>
                                    </div>
                                    <div className="setting-control">
                                        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                                            <option value="light">Light</option>
                                            <option value="dark">Dark</option>
                                            <option value="auto">Auto</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Date Format</div>
                                        <div className="setting-description">Display format for dates</div>
                                    </div>
                                    <div className="setting-control">
                                        <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                                            <option value="dd.mm.yy">DD.MM.YY</option>
                                            <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                                            <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="setting-buttons">
                                    <button className="btn-primary" onClick={saveAppearanceSettings}>Save Changes</button>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* Reports Page */}
                {activeTab === 'reports' && (
                    <div id="reports-page">
                        <h2 className="page-title">Reports</h2>
                        <div className="empty-page">
                            <p>Reports page - Coming soon</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer>
                <p>System Status: <a href="#">OPERATIONAL</a></p>
            </footer>
        </div>
    );
};

export default AdminPage;
