import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/AdminPage.css';

const AdminPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');

    // State variables matching the provided JS logic
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalNotes, setTotalNotes] = useState(0);
    const [storageUsed, setStorageUsed] = useState(0);
    const [storageTotal, setStorageTotal] = useState(0);
    const [adminLogs, setAdminLogs] = useState([]);
    const [notes, setNotes] = useState([]);

    // Settings State
    const [settings, setSettings] = useState({
        adminName: 'Administrator',
        adminEmail: 'admin@noteflow.com',
        adminPassword: '',
        twoFactor: false,
        siteName: 'NoteFlow',
        defaultLanguage: 'en',
        timezone: 'UTC',
        maintenanceMode: false,
        publicRegistration: true,
        emailVerification: true,
        maxNotes: 100,
        storageLimit: 500,
        minPassword: 8,
        sessionTimeout: 30,
        maxLogin: 5,
        logRetention: 90,
        smtpServer: '',
        smtpPort: 587,
        emailNotifications: true,
        autoBackup: true,
        backupFrequency: 'daily',
        dataRetention: 30,
        apiEnabled: true,
        rateLimit: 1000,
        theme: 'light',
        dateFormat: 'dd.mm.yy'
    });

    useEffect(() => {
        loadStatistics();
    }, []);

    // Logic functions from provided JS
    const loadStatistics = () => {
        // Show empty state initially
        loadAdminLogs([]);
        loadNotes([]);
        updateStorageUsed(0, 10240); // Default: 0 MB used of 10 GB (10240 MB)
    };

    const loadAdminLogs = (logs) => {
        if (logs && logs.length > 0) {
            setAdminLogs([...logs]);
        } else {
            setAdminLogs([]);
        }
    };

    const loadNotes = (notesList) => {
        if (notesList && notesList.length > 0) {
            setNotes([...notesList]);
        } else {
            setNotes([]);
        }
    };

    const updateStorageUsed = (used, total) => {
        setStorageUsed(used);
        setStorageTotal(total);
    };

    const addAdminLog = (logMessage) => {
        setAdminLogs(prevLogs => {
            const newLogs = [logMessage, ...prevLogs];
            if (newLogs.length > 50) {
                newLogs.pop();
            }
            return newLogs;
        });
    };

    const addNewNote = (noteData) => {
        setNotes(prevNotes => [noteData, ...prevNotes]);
        setTotalNotes(prev => prev + 1);
    };

    const deleteNote = (id) => {
        // Simulate transition delay if needed, but for React state update is enough
        setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    };

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        navigate('/login');
    };

    // Settings Handlers
    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleInputChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const saveAccountSettings = () => {
        alert('Account settings saved successfully!');
        console.log('Saving account settings:', {
            name: settings.adminName,
            email: settings.adminEmail,
            password: settings.adminPassword
        });
    };

    const saveSystemSettings = () => {
        alert('System settings saved successfully!');
        console.log('Saving system settings:', {
            siteName: settings.siteName,
            language: settings.defaultLanguage,
            timezone: settings.timezone
        });
    };

    const saveUserSettings = () => {
        alert('User management settings saved successfully!');
        console.log('Saving user settings:', {
            maxNotes: settings.maxNotes,
            storageLimit: settings.storageLimit
        });
    };

    const saveSecuritySettings = () => {
        alert('Security settings saved successfully!');
        console.log('Saving security settings:', {
            minPassword: settings.minPassword,
            sessionTimeout: settings.sessionTimeout,
            maxLogin: settings.maxLogin,
            logRetention: settings.logRetention
        });
    };

    const saveEmailSettings = () => {
        alert('Email settings saved successfully!');
        console.log('Saving email settings:', {
            smtpServer: settings.smtpServer,
            smtpPort: settings.smtpPort
        });
    };

    const testEmail = () => {
        alert('Test email sent! Check your inbox.');
    };

    const saveBackupSettings = () => {
        alert('Backup settings saved successfully!');
        console.log('Saving backup settings:', {
            frequency: settings.backupFrequency,
            retention: settings.dataRetention
        });
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
        alert('API settings saved successfully!');
        console.log('Saving API settings:', { rateLimit: settings.rateLimit });
    };

    const regenerateApiKey = () => {
        if (window.confirm('Are you sure you want to regenerate the API key? This will invalidate the current key.')) {
            alert('New API key generated: ' + Math.random().toString(36).substring(2, 15));
        }
    };

    const saveAppearanceSettings = () => {
        alert('Appearance settings saved successfully!');
        console.log('Saving appearance settings:', {
            theme: settings.theme,
            dateFormat: settings.dateFormat
        });
    };

    // Helper for storage display
    const getStorageDisplay = () => {
        let usedDisplay, totalDisplay, unit;
        if (storageTotal >= 1024) {
            usedDisplay = (storageUsed / 1024).toFixed(2);
            totalDisplay = (storageTotal / 1024).toFixed(2);
            unit = 'GB';
        } else {
            usedDisplay = storageUsed.toFixed(2);
            totalDisplay = storageTotal.toFixed(2);
            unit = 'MB';
        }
        return { usedDisplay, totalDisplay, unit };
    };

    const { usedDisplay, totalDisplay, unit } = getStorageDisplay();
    const storagePercentage = storageTotal > 0 ? (storageUsed / storageTotal) * 100 : 0;

    let progressBarColor = '#3b82f6'; // Blue
    if (storagePercentage >= 90) {
        progressBarColor = '#ef4444'; // Red
    } else if (storagePercentage >= 75) {
        progressBarColor = '#f59e0b'; // Orange
    }

    return (
        <div className="admin-page-container">
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
                                <div className="stat-value" id="total-users">{totalUsers.toLocaleString()}</div>
                            </div>

                            <div className="stat-card green">
                                <div className="stat-label">Total Notes</div>
                                <div className="stat-value" id="total-notes">{totalNotes.toLocaleString()}</div>
                            </div>

                            <div className="stat-card gray">
                                <div className="stat-label">Storage Used</div>
                                <div className="stat-value" id="storage-used" style={{ fontSize: '28px' }}>
                                    {usedDisplay} {unit}
                                </div>
                                <div style={{ marginTop: '12px' }}>
                                    <div style={{ backgroundColor: '#e5e7eb', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                                        <div
                                            id="storage-progress"
                                            style={{
                                                backgroundColor: progressBarColor,
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
                                    {notes.length > 0 ? (
                                        notes.map(note => (
                                            <div className="note-item" key={note.id} data-id={note.id}>
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
                                        ))
                                    ) : (
                                        <div className="empty-notes">No notes available</div>
                                    )}
                                </div>
                            </div>

                            {/* Admin History Log */}
                            <div className="card">
                                <h3 className="card-title">Admin History Log</h3>
                                <div id="admin-log-list">
                                    {adminLogs.length > 0 ? (
                                        adminLogs.map((log, index) => (
                                            <div className="log-item" key={index}>
                                                <div className="avatar">U</div>
                                                <div className="log-text">{log}</div>
                                            </div>
                                        ))
                                    ) : (
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
                                            value={settings.adminName}
                                            onChange={(e) => handleInputChange('adminName', e.target.value)}
                                            placeholder="Admin Name"
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
                                            value={settings.adminEmail}
                                            onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                                            placeholder="admin@example.com"
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
                                            value={settings.adminPassword}
                                            onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                                            placeholder="New password"
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
                                            className={`toggle-switch ${settings.twoFactor ? 'active' : ''}`}
                                            onClick={() => toggleSetting('twoFactor')}
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
                                            value={settings.siteName}
                                            onChange={(e) => handleInputChange('siteName', e.target.value)}
                                            placeholder="Site Name"
                                        />
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-label">
                                        <div className="setting-title">Default Language</div>
                                        <div className="setting-description">System default language</div>
                                    </div>
                                    <div className="setting-control">
                                        <select
                                            value={settings.defaultLanguage}
                                            onChange={(e) => handleInputChange('defaultLanguage', e.target.value)}
                                        >
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
                                        <select
                                            value={settings.timezone}
                                            onChange={(e) => handleInputChange('timezone', e.target.value)}
                                        >
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
                                            className={`toggle-switch ${settings.maintenanceMode ? 'active' : ''}`}
                                            onClick={() => toggleSetting('maintenanceMode')}
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
                                            className={`toggle-switch ${settings.publicRegistration ? 'active' : ''}`}
                                            onClick={() => toggleSetting('publicRegistration')}
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
                                            className={`toggle-switch ${settings.emailVerification ? 'active' : ''}`}
                                            onClick={() => toggleSetting('emailVerification')}
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
                                            value={settings.maxNotes}
                                            onChange={(e) => handleInputChange('maxNotes', e.target.value)}
                                            min="0"
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
                                            value={settings.storageLimit}
                                            onChange={(e) => handleInputChange('storageLimit', e.target.value)}
                                            min="0"
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
                                            value={settings.minPassword}
                                            onChange={(e) => handleInputChange('minPassword', e.target.value)}
                                            min="4"
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
                                            value={settings.sessionTimeout}
                                            onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                                            min="5"
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
                                            value={settings.maxLogin}
                                            onChange={(e) => handleInputChange('maxLogin', e.target.value)}
                                            min="3"
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
                                            value={settings.logRetention}
                                            onChange={(e) => handleInputChange('logRetention', e.target.value)}
                                            min="7"
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
                                            value={settings.smtpServer}
                                            onChange={(e) => handleInputChange('smtpServer', e.target.value)}
                                            placeholder="smtp.gmail.com"
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
                                            value={settings.smtpPort}
                                            onChange={(e) => handleInputChange('smtpPort', e.target.value)}
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
                                            className={`toggle-switch ${settings.emailNotifications ? 'active' : ''}`}
                                            onClick={() => toggleSetting('emailNotifications')}
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
                                            className={`toggle-switch ${settings.autoBackup ? 'active' : ''}`}
                                            onClick={() => toggleSetting('autoBackup')}
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
                                        <select
                                            value={settings.backupFrequency}
                                            onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                                        >
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
                                            value={settings.dataRetention}
                                            onChange={(e) => handleInputChange('dataRetention', e.target.value)}
                                            min="0"
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
                                            className={`toggle-switch ${settings.apiEnabled ? 'active' : ''}`}
                                            onClick={() => toggleSetting('apiEnabled')}
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
                                            value={settings.rateLimit}
                                            onChange={(e) => handleInputChange('rateLimit', e.target.value)}
                                            min="100"
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
                                        <select
                                            value={settings.theme}
                                            onChange={(e) => handleInputChange('theme', e.target.value)}
                                        >
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
                                        <select
                                            value={settings.dateFormat}
                                            onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                                        >
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
