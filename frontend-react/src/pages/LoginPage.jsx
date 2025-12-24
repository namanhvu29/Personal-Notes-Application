import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/login.css';

const API_URL = 'http://localhost:8080/foundation';

const LoginPage = () => {
    const [view, setView] = useState('login'); // login, forgot, verify, reset
    const navigate = useNavigate();

    // State for forms
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [email, setEmail] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [resetData, setResetData] = useState({ newPassword: '', confirmNewPassword: '' });
    const [message, setMessage] = useState({ text: '', type: '' }); // type: error or success
    const [isLoading, setIsLoading] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const resendTimerRef = useRef(null);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (resendTimerRef.current) {
                clearInterval(resendTimerRef.current);
            }
        };
    }, []);

    // Handle resend countdown
    useEffect(() => {
        if (resendCountdown > 0) {
            resendTimerRef.current = setInterval(() => {
                setResendCountdown(prev => prev - 1);
            }, 1000);
        } else {
            if (resendTimerRef.current) {
                clearInterval(resendTimerRef.current);
            }
        }
        return () => {
            if (resendTimerRef.current) {
                clearInterval(resendTimerRef.current);
            }
        };
    }, [resendCountdown]);

    const handleLoginSubmit = async (e) => {
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
        setIsLoading(true);
        setMessage({ text: 'Đang đăng nhập...', type: 'info' });

        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usernameOrEmail: loginData.username,
                    password: loginData.password
                })
            });

            // Parse response as JSON or text
            const contentType = response.headers.get('content-type');
            let result;

            if (contentType && contentType.includes('application/json')) {
                result = await response.json();
            } else {
                const text = await response.text();
                result = { message: text };
            }

            if (!response.ok) {
                setMessage({ text: result.message || result, type: 'error' });
                setIsLoading(false);
                return;
            }

            // Lưu token và thông tin user vào localStorage
            if (result.token) {
                localStorage.setItem('token', result.token);
            }

            localStorage.setItem('currentUser', JSON.stringify({
                user_id: result.user_id,
                username: result.username,
                email: result.email,
                role: result.role || 'USER'
            }));

            console.log('✅ Đăng nhập thành công!', result);

            setMessage({ text: result.message || 'Đăng nhập thành công!', type: 'success' });

            // Navigate to dashboard instead of /
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            setMessage({ text: 'Lỗi kết nối server!', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: 'Đang gửi mã xác thực...', type: 'info' });

        try {
            const response = await fetch(`${API_URL}/users/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            });

            const result = await response.text();

            if (!response.ok) {
                setMessage({ text: result, type: 'error' });
                setIsLoading(false);
                return;
            }

            setMessage({ text: result, type: 'success' });
            setTimeout(() => {
                setView('verify');
                setMessage({ text: '', type: '' });
                setResendCountdown(60); // Start 60s countdown
            }, 1000);

        } catch (error) {
            console.error('Forgot password error:', error);
            setMessage({ text: 'Lỗi kết nối server!', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setIsLoading(true);
        setMessage({ text: 'Đang gửi lại mã...', type: 'info' });

        try {
            const response = await fetch(`${API_URL}/users/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            });

            const result = await response.text();

            if (!response.ok) {
                setMessage({ text: result, type: 'error' });
                setIsLoading(false);
                return;
            }

            setMessage({ text: 'Mã mới đã được gửi!', type: 'success' });
            setResendCountdown(60); // Restart countdown

        } catch (error) {
            setMessage({ text: 'Lỗi kết nối server!', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();

        if (!verifyCode || verifyCode.length !== 6) {
            setMessage({ text: 'Vui lòng nhập mã 6 số!', type: 'error' });
            return;
        }

        setIsLoading(true);
        setMessage({ text: 'Đang xác thực...', type: 'info' });

        try {
            const response = await fetch(`${API_URL}/users/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    code: verifyCode
                })
            });

            const result = await response.text();

            if (!response.ok) {
                setMessage({ text: result, type: 'error' });
                setIsLoading(false);
                return;
            }

            setMessage({ text: result, type: 'success' });
            setTimeout(() => {
                setView('reset');
                setMessage({ text: '', type: '' });
            }, 1000);

        } catch (error) {
            console.error('Verify code error:', error);
            setMessage({ text: 'Lỗi kết nối server!', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();

        if (!resetData.newPassword || !resetData.confirmNewPassword) {
            setMessage({ text: 'Vui lòng nhập đầy đủ thông tin!', type: 'error' });
            return;
        }

        if (resetData.newPassword !== resetData.confirmNewPassword) {
            setMessage({ text: 'Mật khẩu xác nhận không khớp!', type: 'error' });
            return;
        }

        setIsLoading(true);
        setMessage({ text: 'Đang đặt lại mật khẩu...', type: 'info' });

        try {
            const response = await fetch(`${API_URL}/users/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    code: verifyCode,
                    newPassword: resetData.newPassword,
                    confirmPassword: resetData.confirmNewPassword
                })
            });

            const result = await response.text();

            if (!response.ok) {
                setMessage({ text: result, type: 'error' });
                setIsLoading(false);
                return;
            }

            setMessage({ text: result + ' Đang chuyển về đăng nhập...', type: 'success' });
            setTimeout(() => {
                setView('login');
                setEmail('');
                setVerifyCode('');
                setResetData({ newPassword: '', confirmNewPassword: '' });
                setMessage({ text: 'Đổi mật khẩu thành công. Vui lòng đăng nhập.', type: 'success' });
            }, 2000);

        } catch (error) {
            console.error('Reset password error:', error);
            setMessage({ text: 'Lỗi kết nối server!', type: 'error' });
        } finally {
            setIsLoading(false);
        }
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
                        disabled={isLoading}
                    />
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        required
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                    {message.text && (
                        <p id="errorMsg" style={{
                            color: message.type === 'error' ? 'red' : message.type === 'success' ? 'green' : '#999'
                        }}>
                            {message.text}
                        </p>
                    )}
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
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Đang gửi...' : 'Tiếp tục'}
                    </button>
                    {message.text && (
                        <p style={{
                            color: message.type === 'error' ? 'red' : message.type === 'success' ? 'green' : '#999'
                        }}>
                            {message.text}
                        </p>
                    )}
                    <p><a href="#" onClick={(e) => { e.preventDefault(); setView('login'); setMessage({ text: '', type: '' }); }}>Quay lại đăng nhập</a></p>
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
                        onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Đang xác thực...' : 'Xác thực'}
                    </button>
                    <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isLoading || resendCountdown > 0}
                        style={{ marginTop: '10px', opacity: resendCountdown > 0 ? 0.6 : 1 }}
                    >
                        {resendCountdown > 0 ? `Gửi lại mã (${resendCountdown}s)` : 'Gửi lại mã'}
                    </button>
                    {message.text && (
                        <p style={{
                            color: message.type === 'error' ? 'red' : message.type === 'success' ? 'green' : '#999'
                        }}>
                            {message.text}
                        </p>
                    )}
                    <p><a href="#" onClick={(e) => { e.preventDefault(); setView('login'); setMessage({ text: '', type: '' }); }}>Quay lại đăng nhập</a></p>
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
                        disabled={isLoading}
                    />
                    <input
                        type="password"
                        placeholder="Nhập lại mật khẩu mới"
                        required
                        value={resetData.confirmNewPassword}
                        onChange={(e) => setResetData({ ...resetData, confirmNewPassword: e.target.value })}
                        disabled={isLoading}
                    />
                    <p className="password-hint">≥8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt</p>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </button>
                    {message.text && (
                        <p id="resetMsg" style={{
                            color: message.type === 'error' ? 'red' : message.type === 'success' ? 'green' : '#999'
                        }}>
                            {message.text}
                        </p>
                    )}
                </form>
            )}
        </div>
    );
};

export default LoginPage;
