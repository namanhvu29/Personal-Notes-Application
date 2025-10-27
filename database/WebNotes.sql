
CREATE DATABASE WebNotesSystem;
GO
USE WebNotesSystem;
GO
-- 1. USERS TABLE
CREATE TABLE Users (
    user_id INT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    is_active BIT DEFAULT 1
);
-- 2. ADMINS TABLE
CREATE TABLE Admins (
    admin_id INT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
-- 3. NOTES TABLE
CREATE TABLE Notes (
    note_id INT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NULL,
    title VARCHAR(100),
    content TEXT,
    created_date DATE DEFAULT GETDATE(),
    last_modified DATE,
    is_important BIT DEFAULT 0,
    CONSTRAINT FK_Notes_Users FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);
-- 4. CATEGORIES TABLE
CREATE TABLE Categories (
    category_id INT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT
);
-- 5. TAGS TABLE
CREATE TABLE Tags (
    tag_id INT PRIMARY KEY,
    tag_name VARCHAR(100) NOT NULL
);
-- 6. NOTE_TAGS (M:N relationship)
CREATE TABLE NoteTags (
    note_tag_id INT PRIMARY KEY,
    note_id INT NOT NULL,
    tag_id INT NOT NULL,
    CONSTRAINT FK_NoteTags_Notes FOREIGN KEY (note_id)
        REFERENCES Notes(note_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_NoteTags_Tags FOREIGN KEY (tag_id)
        REFERENCES Tags(tag_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);
-- 7. SYSTEM_STATISTICS TABLE
CREATE TABLE SystemStatistics (
    stat_id INT PRIMARY KEY,
    total_users INT DEFAULT 0,
    total_notes INT DEFAULT 0,
    active_users INT DEFAULT 0,
    last_updated DATE DEFAULT GETDATE(),
    admin_id INT,
    CONSTRAINT FK_SystemStatistics_Admins FOREIGN KEY (admin_id)
        REFERENCES Admins(admin_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- 8. AUTHENTICATION_MANAGER TABLE
CREATE TABLE AuthenticationManager (
    session_id INT PRIMARY KEY,
    session_list TEXT,
    active_tokens TEXT
);
SELECT * FROM Users




