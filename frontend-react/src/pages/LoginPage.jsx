import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/login.css';

const LoginPage = () => {
    const [view, setView] = useState('login'); // login, forgot, verify, reset
    const navigate = useNavigate();

    // State for forms
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [email, setEmail] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [resetData, setResetData] = useState({ newPassword: '', confirmNewPassword: '' });
    const [message, setMessage] = useState({ text: '', type: '' }); // type: error or success

    const handleLoginSubmit = (e) => {
        e.preventDefault();

        // Mock Login Logic
        const { username, password } = loginData;

        // Check for Admin
        if ((username === 'admin1' || username === 'admin2' || username === 'admin3') && password === '123') {
            console.log('Logged in as Admin');
            localStorage.setItem('userRole', 'ADMIN');
            localStorage.setItem('username', username);
            navigate('/admin');
        } else {
            // Default to User for any other input (Mock)
            console.log('Logged in as User');
            localStorage.setItem('userRole', 'USER');
            localStorage.setItem('username', username);
            navigate('/dashboard');
        }
    };

    const handleForgotSubmit = (e) => {
        e.preventDefault();
        console.log('Forgot Password:', email);
        setView('verify');
    };

    const handleVerifySubmit = (e) => {
        e.preventDefault();
        console.log('Verify Code:', verifyCode);
        setView('reset');
    };

    const handleResetSubmit = (e) => {
        e.preventDefault();
        console.log('Reset Password:', resetData);
        if (resetData.newPassword !== resetData.confirmNewPassword) {
            setMessage({ text: 'Mật khẩu không khớp', type: 'error' });
            return;
        }
        setView('login');
        setMessage({ text: 'Đổi mật khẩu thành công. Vui lòng đăng nhập.', type: 'success' });
    };

    return (
        <div className="auth-container">
            {/* LOGIN FORM */}
            {view === 'login' && (
                <form className="login-box" onSubmit={handleLoginSubmit}>
                    <h2>Đăng nhập</h2>
                    <input
                        type="text"
                        placeholder="Tên đăng nhập hoặc Email"
                        required
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        required
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />
                    <button type="submit">Đăng nhập</button>
                    {message.text && <p id="errorMsg" style={{ color: message.type === 'error' ? 'red' : 'green' }}>{message.text}</p>}
                    <p className="forgot-password-link">
                        <a href="#" onClick={(e) => { e.preventDefault(); setView('forgot'); setMessage({ text: '', type: '' }); }}>Quên mật khẩu?</a>
                    </p>
                    <p>Bạn chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
                </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {view === 'forgot' && (
                <form className="login-box" onSubmit={handleForgotSubmit}>
                    <h2>Quên mật khẩu</h2>
                    <p className="form-description">Nhập email của bạn để nhận mã xác thực</p>
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button type="submit">Tiếp tục</button>
                    <p><a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }}>Quay lại đăng nhập</a></p>
                </form>
            )}

            {/* VERIFY CODE FORM */}
            {view === 'verify' && (
                <form className="login-box" onSubmit={handleVerifySubmit}>
                    <h2>Xác thực mã</h2>
                    <p className="form-description">Nhập mã xác thực đã được gửi đến email của bạn</p>
                    <input
                        type="text"
                        placeholder="Mã xác thực (6 số)"
                        maxLength="6"
                        required
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                    />
                    <button type="submit">Xác thực</button>
                    <button type="button" id="resendCodeBtn" disabled>Gửi lại mã (60s)</button>
                    <p><a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }}>Quay lại đăng nhập</a></p>
                </form>
            )}

            {/* RESET PASSWORD FORM */}
            {view === 'reset' && (
                <form className="login-box" onSubmit={handleResetSubmit}>
                    <h2>Đặt lại mật khẩu</h2>
                    <input
                        type="password"
                        placeholder="Mật khẩu mới"
                        required
                        value={resetData.newPassword}
                        onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Nhập lại mật khẩu mới"
                        required
                        value={resetData.confirmNewPassword}
                        onChange={(e) => setResetData({ ...resetData, confirmNewPassword: e.target.value })}
                    />
                    <p className="password-hint">≥8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt</p>
                    <button type="submit">Đổi mật khẩu</button>
                    {message.text && <p id="resetMsg" style={{ color: 'red' }}>{message.text}</p>}
                </form>
            )}
        </div>
    );
};

export default LoginPage;
