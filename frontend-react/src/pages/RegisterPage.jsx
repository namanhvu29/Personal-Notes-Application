import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/login.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setMessage('Mật khẩu xác nhận không khớp');
            return;
        }
        // TODO: Implement API call
        console.log('Register:', formData);
        // Mock success
        navigate('/login');
    };

    return (
        <div className="auth-container">
            <form className="login-box" onSubmit={handleSubmit}>
                <h2>Đăng ký tài khoản</h2>
                <input
                    type="text"
                    placeholder="Tên đăng nhập"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />

                <input
                    type="email"
                    placeholder="Email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <input
                    type="password"
                    placeholder="Mật khẩu"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <p className="password-hint">Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, chữ thường số và kí tự đặc biệt</p>

                <input
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                <button type="submit">Đăng ký</button>
                {message && <p id="registerMsg" style={{ color: 'red' }}>{message}</p>}
                <p>Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
            </form>
        </div>
    );
};

export default RegisterPage;
