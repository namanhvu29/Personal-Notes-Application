<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NoteFlow Admin Dashboard</title>
</head>
<body>
<script>
        // State variables
        let totalUsers = 0;
        let totalNotes = 0;
        let systemUptime = 0;
        let adminLogs = [];
        let notes = [];

        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        const pages = {
            'dashboard': document.getElementById('dashboard-page'),
            'notes': document.getElementById('notes-page'),
            'settings': document.getElementById('settings-page')
        };

        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                const pageName = this.getAttribute('data-page');
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Show/hide pages
                Object.keys(pages).forEach(key => {
                    if (key === pageName) {
                        pages[key].classList.remove('hidden');
                    } else {
                        pages[key].classList.add('hidden');
                    }
                });
            });
        });

        // Function to update user count (will be called when new user registers)
        function updateUserCount() {
            totalUsers++;
            document.getElementById('total-users').textContent = totalUsers.toLocaleString();
        }

        // Function to update note count (will be called when new note is created)
        function updateNoteCount() {
            totalNotes++;
            document.getElementById('total-notes').textContent = totalNotes.toLocaleString();
        }

        // Function to update system uptime (will be called by backend)
        function updateSystemUptime(uptimePercentage) {
            systemUptime = uptimePercentage;
            document.getElementById('system-uptime').textContent = systemUptime + '%';
        }

        // Function to add new admin log entry
        function addAdminLog(logMessage) {
            const logContainer = document.getElementById('admin-log-list');
            
            // Remove empty message if exists
            const emptyMessage = logContainer.querySelector('.empty-log');
            if (emptyMessage) {
                emptyMessage.remove();
            }

            // Create new log item
            const logItem = document.createElement('div');
            logItem.className = 'log-item';
            logItem.innerHTML = `
                <div class="avatar">U</div>
                <div class="log-text">${logMessage}</div>
            `;
            
            // Add to beginning of list (newest first)
            logContainer.insertBefore(logItem, logContainer.firstChild);
            
            // Store in array
            adminLogs.unshift(logMessage);
            
            // Optional: Limit to last 50 logs
            if (adminLogs.length > 50) {
                adminLogs.pop();
                const lastLog = logContainer.lastElementChild;
                if (lastLog) lastLog.remove();
            }
        }

        // Function to load admin logs from backend
        function loadAdminLogs(logs) {
            const logContainer = document.getElementById('admin-log-list');
            logContainer.innerHTML = '';
            
            if (logs && logs.length > 0) {
                logs.forEach(log => {
                    const logItem = document.createElement('div');
                    logItem.className = 'log-item';
                    logItem.innerHTML = `
                        <div class="avatar">U</div>
                        <div class="log-text">${log}</div>
                    `;
                    logContainer.appendChild(logItem);
                });
                adminLogs = [...logs];
            } else {
                logContainer.innerHTML = '<div class="empty-log">No admin activities recorded</div>';
            }
        }

        // Function to add new note
        function addNewNote(noteData) {
            const notesContainer = document.getElementById('notes-list');
            
            // Remove empty message if exists
            const emptyMessage = notesContainer.querySelector('.empty-notes');
            if (emptyMessage) {
                emptyMessage.remove();
            }

            // Create new note item
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            noteItem.setAttribute('data-id', noteData.id);
            noteItem.innerHTML = `
                <div class="note-content">
                    <div class="avatar">U</div>
                    <div class="note-info">
                        <div class="note-title">${noteData.title}</div>
                        <div class="note-meta">${noteData.author} | ${noteData.date}</div>
                    </div>
                </div>
                <div class="note-actions">
                    <button class="icon-btn">🔍</button>
                    <button class="icon-btn delete" onclick="deleteNote('${noteData.id}')">🗑️</button>
                </div>
            `;
            
            // Add to beginning of list (newest first)
            notesContainer.insertBefore(noteItem, notesContainer.firstChild);
            
            // Store in array
            notes.unshift(noteData);
        }

        // Function to load notes from backend
        function loadNotes(notesList) {
            const notesContainer = document.getElementById('notes-list');
            notesContainer.innerHTML = '';
            
            if (notesList && notesList.length > 0) {
                notesList.forEach(note => {
                    const noteItem = document.createElement('div');
                    noteItem.className = 'note-item';
                    noteItem.setAttribute('data-id', note.id);
                    noteItem.innerHTML = `
                        <div class="note-content">
                            <div class="avatar">U</div>
                            <div class="note-info">
                                <div class="note-title">${note.title}</div>
                                <div class="note-meta">${note.author} | ${note.date}</div>
                            </div>
                        </div>
                        <div class="note-actions">
                            <button class="icon-btn">🔍</button>
                            <button class="icon-btn delete" onclick="deleteNote('${note.id}')">🗑️</button>
                        </div>
                    `;
                    notesContainer.appendChild(noteItem);
                });
                notes = [...notesList];
            } else {
                notesContainer.innerHTML = '<div class="empty-notes">No notes available</div>';
            }
        }

        // Delete note function
        function deleteNote(id) {
            const noteElement = document.querySelector(`.note-item[data-id="${id}"]`);
            if (noteElement) {
                noteElement.style.transition = 'opacity 0.3s';
                noteElement.style.opacity = '0';
                setTimeout(() => {
                    noteElement.remove();
                    
                    // Remove from array
                    notes = notes.filter(note => note.id != id);
                    
                    // Show empty state if no notes left
                    const notesContainer = document.getElementById('notes-list');
                    if (notes.length === 0) {
                        notesContainer.innerHTML = '<div class="empty-notes">No notes available</div>';
                    }
                }, 300);
            }
        }

        // Logout function
        function handleLogout() {
            // Redirect to login page
            window.location.href = '/login';
        }

        // Load statistics from backend on page load
        function loadStatistics() {
     
            // Show empty state initially
            loadAdminLogs([]);
            loadNotes([]);
        }

        // Load statistics when page loads
        window.addEventListener('DOMContentLoaded', loadStatistics);

        // Settings functions
        function toggleSetting(element) {
            element.classList.toggle('active');
        }

        function saveAccountSettings() {
            const name = document.getElementById('admin-name').value;
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;
            
            // In real application, send to backend
            alert('Account settings saved successfully!');
            console.log('Saving account settings:', { name, email, password });
        }

        function saveSystemSettings() {
            const siteName = document.getElementById('site-name').value;
            const language = document.getElementById('default-language').value;
            const timezone = document.getElementById('timezone').value;
            
            alert('System settings saved successfully!');
            console.log('Saving system settings:', { siteName, language, timezone });
        }

        function saveUserSettings() {
            const maxNotes = document.getElementById('max-notes').value;
            const storageLimit = document.getElementById('storage-limit').value;
            
            alert('User management settings saved successfully!');
            console.log('Saving user settings:', { maxNotes, storageLimit });
        }

        function saveSecuritySettings() {
            const minPassword = document.getElementById('min-password').value;
            const sessionTimeout = document.getElementById('session-timeout').value;
            const maxLogin = document.getElementById('max-login').value;
            const logRetention = document.getElementById('log-retention').value;
            
            alert('Security settings saved successfully!');
            console.log('Saving security settings:', { minPassword, sessionTimeout, maxLogin, logRetention });
        }

        function saveEmailSettings() {
            const smtpServer = document.getElementById('smtp-server').value;
            const smtpPort = document.getElementById('smtp-port').value;
            
            alert('Email settings saved successfully!');
            console.log('Saving email settings:', { smtpServer, smtpPort });
        }

        function testEmail() {
            alert('Test email sent! Check your inbox.');
        }

        function saveBackupSettings() {
            const frequency = document.getElementById('backup-frequency').value;
            const retention = document.getElementById('data-retention').value;
            
            alert('Backup settings saved successfully!');
            console.log('Saving backup settings:', { frequency, retention });
        }

        function createBackup() {
            alert('Creating backup... This may take a few moments.');
            setTimeout(() => {
                alert('Backup created successfully!');
            }, 2000);
        }

        function exportData() {
            alert('Exporting data... Download will start shortly.');
            setTimeout(() => {
                alert('Data exported successfully!');
            }, 2000);
        }

        function saveApiSettings() {
            const rateLimit = document.getElementById('rate-limit').value;
            
            alert('API settings saved successfully!');
            console.log('Saving API settings:', { rateLimit });
        }

        function regenerateApiKey() {
            if (confirm('Are you sure you want to regenerate the API key? This will invalidate the current key.')) {
                alert('New API key generated: ' + Math.random().toString(36).substring(2, 15));
            }
        }

        function saveAppearanceSettings() {
            const theme = document.getElementById('theme').value;
            const dateFormat = document.getElementById('date-format').value;
            
            alert('Appearance settings saved successfully!');
            console.log('Saving appearance settings:', { theme, dateFormat });
        }

    </script>
</body>