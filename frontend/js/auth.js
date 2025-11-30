// ========================================
// AUTH.JS - XỬ LÝ ĐĂNG NHẬP, ĐĂNG KÝ, QUÊN MẬT KHẨU
// ========================================

// API URL
const API_URL = 'http://localhost:8080/foundation';

console.log('=== AUTH.JS LOADED ===');
console.log('API URL:', API_URL);
console.log('Current Page:', window.location.pathname);

// ========================================
// KHỞI TẠO EVENT LISTENERS - CHỈ CHẠY MỘT LẦN
// ========================================
(function() {
    'use strict';

    // Đảm bảo chỉ chạy khi DOM đã sẵn sàng
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuth);
    } else {
        initAuth();
    }

    function initAuth() {
        console.log('🚀 Initializing Auth...');

        // ========================================
        // ĐĂNG NHẬP - GỌI API BACKEND
        // ========================================
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            console.log('✅ Login form found, attaching event...');

            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault(); // Ngăn form submit mặc định
                e.stopPropagation(); // Ngăn event bubbling

                console.log('🔄 Login form submitted');

                const usernameOrEmail = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value.trim();
                const errorMsg = document.getElementById('errorMsg');

                // Validation
                if (!usernameOrEmail || !password) {
                    errorMsg.style.color = 'red';
                    errorMsg.innerText = '⚠️ Vui lòng nhập đầy đủ thông tin!';
                    return false; // Dừng xử lý
                }

                errorMsg.innerText = 'Đang đăng nhập...';
                errorMsg.style.color = '#999';

                try {
                    console.log('📡 Calling login API...');
                    console.log('Username/Email:', usernameOrEmail);

                    // Bước 1: Gọi API login
                    const loginResponse = await fetch(`${API_URL}/users/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            usernameOrEmail: usernameOrEmail,
                            password: password
                        })
                    });

                    const loginResult = await loginResponse.text();
                    console.log('📥 Login response:', loginResponse.status, loginResult);

                    if (!loginResponse.ok) {
                        errorMsg.style.color = 'red';
                        errorMsg.innerText = loginResult;
                        return false;
                    }

                    // Bước 2: Lấy danh sách users để tìm user_id
                    console.log('📡 Fetching user info...');
                    const usersResponse = await fetch(`${API_URL}/users`);

                    if (!usersResponse.ok) {
                        throw new Error('Không thể lấy thông tin user');
                    }

                    const users = await usersResponse.json();
                    console.log('📥 Users fetched:', users.length);

                    // Bước 3: Tìm user vừa đăng nhập
                    const currentUser = users.find(u =>
                        (u.username === usernameOrEmail || u.email === usernameOrEmail)
                    );

                    if (!currentUser) {
                        errorMsg.style.color = 'red';
                        errorMsg.innerText = 'Không tìm thấy thông tin user!';
                        return false;
                    }

                    console.log('✅ User found:', currentUser.username);

                    // Bước 4: Lưu vào localStorage với đầy đủ thông tin
                    const userInfo = {
                        user_id: currentUser.user_id,
                        username: currentUser.username,
                        email: currentUser.email,
                        role: currentUser.role || 'user'
                    };

                    localStorage.setItem('currentUser', JSON.stringify(userInfo));

                    console.log('💾 Saved to localStorage:', userInfo);

                    // Bước 5: Chuyển hướng
                    errorMsg.style.color = 'green';
                    errorMsg.innerText = '✅ Đăng nhập thành công! Đang chuyển hướng...';

                    const targetPage = userInfo.role === 'admin' ? 'admin.html' : 'index.html';
                    console.log('🔄 Redirecting to:', targetPage);

                    setTimeout(() => {
                        window.location.href = targetPage;
                    }, 1000);

                } catch (error) {
                    console.error('❌ Login error:', error);
                    errorMsg.style.color = 'red';
                    errorMsg.innerText = 'Lỗi kết nối server! Kiểm tra backend có đang chạy không.';
                }

                return false; // Đảm bảo không submit form
            });

            console.log('✅ Login event listener attached');
        } else {
            console.log('ℹ️ Login form not found on this page');
        }

        // ========================================
        // ĐĂNG KÝ - GỌI API BACKEND
        // ========================================
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            console.log('✅ Register form found, attaching event...');

            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                console.log('🔄 Register form submitted');

                const newUsername = document.getElementById('newUsername').value.trim();
                const newEmail = document.getElementById('newEmail').value.trim();
                const newPassword = document.getElementById('newPassword').value.trim();
                const confirmPassword = document.getElementById('confirmPassword').value.trim();
                const registerMsg = document.getElementById('registerMsg');

                // Validation
                if (!newUsername || !newEmail || !newPassword || !confirmPassword) {
                    registerMsg.innerText = '⚠️ Vui lòng nhập đầy đủ thông tin.';
                    registerMsg.style.color = 'red';
                    return false;
                }

                if (newPassword !== confirmPassword) {
                    registerMsg.innerText = '⚠️ Mật khẩu xác nhận không khớp.';
                    registerMsg.style.color = 'red';
                    return false;
                }

                registerMsg.innerText = 'Đang đăng ký...';
                registerMsg.style.color = '#999';

                try {
                    console.log('📡 Calling register API...');

                    const response = await fetch(`${API_URL}/users/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: newUsername,
                            email: newEmail,
                            password: newPassword,
                            confirmPassword: confirmPassword
                        })
                    });

                    const result = await response.text();
                    console.log('📥 Register response:', response.status, result);

                    if (!response.ok) {
                        registerMsg.style.color = 'red';
                        registerMsg.innerText = result;
                        return false;
                    }

                    registerMsg.style.color = 'green';
                    registerMsg.innerText = '✅ Đăng ký thành công! Đang chuyển hướng...';

                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);

                } catch (error) {
                    console.error('❌ Register error:', error);
                    registerMsg.style.color = 'red';
                    registerMsg.innerText = 'Lỗi kết nối server!';
                }

                return false;
            });

            console.log('✅ Register event listener attached');
        } else {
            console.log('ℹ️ Register form not found on this page');
        }

        // ========================================
        // QUÊN MẬT KHẨU - BƯỚC 1: GỬI MÃ
        // ========================================
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        const showForgotPassword = document.getElementById('showForgotPassword');
        const backToLogin = document.getElementById('backToLogin');

        if (showForgotPassword && forgotPasswordForm && loginForm) {
            showForgotPassword.addEventListener('click', (e) => {
                e.preventDefault();
                loginForm.style.display = 'none';
                forgotPasswordForm.style.display = 'block';
            });
        }

        if (backToLogin && forgotPasswordForm && loginForm) {
            backToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                forgotPasswordForm.style.display = 'none';
                loginForm.style.display = 'block';
            });
        }

        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const email = document.getElementById('resetEmail').value.trim();
                const forgotMsg = document.getElementById('forgotMsg');

                if (!email) {
                    forgotMsg.style.color = 'red';
                    forgotMsg.innerText = '⚠️ Vui lòng nhập email!';
                    return false;
                }

                forgotMsg.innerText = 'Đang gửi mã...';
                forgotMsg.style.color = '#999';

                try {
                    const response = await fetch(`${API_URL}/users/forgot-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: email })
                    });

                    const result = await response.text();

                    if (!response.ok) {
                        forgotMsg.style.color = 'red';
                        forgotMsg.innerText = result;
                        return false;
                    }

                    // Lưu email tạm thời
                    sessionStorage.setItem('resetEmail', email);

                    forgotMsg.style.color = 'green';
                    forgotMsg.innerText = '✅ Mã đã được gửi!';

                    // Chuyển sang form nhập mã
                    setTimeout(() => {
                        forgotPasswordForm.style.display = 'none';
                        document.getElementById('verifyCodeForm').style.display = 'block';
                        startResendTimer();
                    }, 1000);

                } catch (error) {
                    console.error('❌ Forgot password error:', error);
                    forgotMsg.style.color = 'red';
                    forgotMsg.innerText = 'Lỗi kết nối server!';
                }

                return false;
            });
        }

        // ========================================
        // QUÊN MẬT KHẨU - BƯỚC 2: XÁC THỰC MÃ
        // ========================================
        const verifyCodeForm = document.getElementById('verifyCodeForm');
        const backToLoginFromVerify = document.getElementById('backToLoginFromVerify');

        if (backToLoginFromVerify && verifyCodeForm && loginForm) {
            backToLoginFromVerify.addEventListener('click', (e) => {
                e.preventDefault();
                verifyCodeForm.style.display = 'none';
                loginForm.style.display = 'block';
            });
        }

        if (verifyCodeForm) {
            verifyCodeForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const code = document.getElementById('verifyCode').value.trim();
                const email = sessionStorage.getItem('resetEmail');
                const verifyMsg = document.getElementById('verifyMsg');

                if (!code || code.length !== 6) {
                    verifyMsg.style.color = 'red';
                    verifyMsg.innerText = '⚠️ Vui lòng nhập mã 6 số!';
                    return false;
                }

                verifyMsg.innerText = 'Đang xác thực...';
                verifyMsg.style.color = '#999';

                try {
                    const response = await fetch(`${API_URL}/users/verify-reset-code`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: email, code: code })
                    });

                    const result = await response.text();

                    if (!response.ok) {
                        verifyMsg.style.color = 'red';
                        verifyMsg.innerText = result;
                        return false;
                    }

                    // Lưu mã xác thực
                    sessionStorage.setItem('resetCode', code);

                    verifyMsg.style.color = 'green';
                    verifyMsg.innerText = '✅ Mã hợp lệ!';

                    // Chuyển sang form đổi mật khẩu
                    setTimeout(() => {
                        verifyCodeForm.style.display = 'none';
                        document.getElementById('resetPasswordForm').style.display = 'block';
                    }, 1000);

                } catch (error) {
                    console.error('❌ Verify code error:', error);
                    verifyMsg.style.color = 'red';
                    verifyMsg.innerText = 'Lỗi kết nối server!';
                }

                return false;
            });
        }

        // ========================================
        // QUÊN MẬT KHẨU - BƯỚC 3: ĐẶT LẠI MẬT KHẨU
        // ========================================
        const resetPasswordForm = document.getElementById('resetPasswordForm');

        if (resetPasswordForm) {
            resetPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const newPassword = document.getElementById('newPassword').value.trim();
                const confirmNewPassword = document.getElementById('confirmNewPassword').value.trim();
                const email = sessionStorage.getItem('resetEmail');
                const code = sessionStorage.getItem('resetCode');
                const resetMsg = document.getElementById('resetMsg');

                if (!newPassword || !confirmNewPassword) {
                    resetMsg.style.color = 'red';
                    resetMsg.innerText = '⚠️ Vui lòng nhập đầy đủ mật khẩu!';
                    return false;
                }

                if (newPassword !== confirmNewPassword) {
                    resetMsg.style.color = 'red';
                    resetMsg.innerText = '⚠️ Mật khẩu xác nhận không khớp!';
                    return false;
                }

                resetMsg.innerText = 'Đang đặt lại mật khẩu...';
                resetMsg.style.color = '#999';

                try {
                    const response = await fetch(`${API_URL}/users/reset-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: email,
                            code: code,
                            newPassword: newPassword,
                            confirmPassword: confirmNewPassword
                        })
                    });

                    const result = await response.text();

                    if (!response.ok) {
                        resetMsg.style.color = 'red';
                        resetMsg.innerText = result;
                        return false;
                    }

                    // Xóa thông tin tạm
                    sessionStorage.removeItem('resetEmail');
                    sessionStorage.removeItem('resetCode');

                    resetMsg.style.color = 'green';
                    resetMsg.innerText = '✅ Đặt lại mật khẩu thành công! Đang chuyển hướng...';

                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);

                } catch (error) {
                    console.error('❌ Reset password error:', error);
                    resetMsg.style.color = 'red';
                    resetMsg.innerText = 'Lỗi kết nối server!';
                }

                return false;
            });
        }

        // ========================================
        // NÚT GỬI LẠI MÃ (RESEND CODE)
        // ========================================
        function startResendTimer() {
            const resendBtn = document.getElementById('resendCodeBtn');
            if (!resendBtn) return;

            let countdown = 60;
            resendBtn.disabled = true;

            const timer = setInterval(() => {
                countdown--;
                resendBtn.textContent = `Gửi lại mã (${countdown}s)`;

                if (countdown <= 0) {
                    clearInterval(timer);
                    resendBtn.disabled = false;
                    resendBtn.textContent = 'Gửi lại mã';
                }
            }, 1000);

            resendBtn.onclick = async () => {
                const email = sessionStorage.getItem('resetEmail');
                if (!email) return;

                try {
                    const response = await fetch(`${API_URL}/users/forgot-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: email })
                    });

                    if (response.ok) {
                        alert('✅ Đã gửi lại mã!');
                        startResendTimer(); // Reset timer
                    }
                } catch (error) {
                    console.error('❌ Resend error:', error);
                }
            };
        }

        // ========================================
        // ĐĂNG XUẤT
        // ========================================
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            console.log('✅ Logout button found');

            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                console.log('✅ Đã đăng xuất');
                window.location.href = 'login.html';
            });
        }

        console.log('🎉 Auth initialization complete!');
    }
})();

// ========================================
// DEBUG INFO
// ========================================
console.log('localStorage currentUser:', localStorage.getItem('currentUser'));