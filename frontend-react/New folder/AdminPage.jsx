import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/admin.css';

const AdminPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // Mock data
        const mockUsers = [
            { id: 1, username: 'user1', role: 'USER', isActive: true },
            { id: 2, username: 'admin', role: 'ADMIN', isActive: true },
            { id: 3, username: 'user2', role: 'USER', isActive: false },
        ];
        setUsers(mockUsers);
    }, []);

    const handleLogout = () => {
        // TODO: Clear auth token
        navigate('/login');
    };

    return (
        <div className="admin-container">
            <h1>Trang Quản Trị</h1>
            <table id="userTable" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <thead style={{ background: '#f0f0f0' }}>
                    <tr>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Tên</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Vai trò</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px' }}>{user.username}</td>
                            <td style={{ padding: '12px' }}>{user.role}</td>
                            <td style={{ padding: '12px' }}>{user.isActive ? 'Hoạt động' : 'Bị khóa'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ marginTop: '20px' }}>
                <button id="logoutBtn" onClick={handleLogout}>Đăng xuất</button>
            </div>
        </div>
    );
};

export default AdminPage;
