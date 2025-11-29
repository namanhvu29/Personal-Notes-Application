// API URL
const API_URL = 'http://localhost:8080/foundation';

// ========================================
// ĐĂNG NHẬP - GỌI API BACKEND
// ========================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const usernameOrEmail = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const errorMsg = document.getElementById('errorMsg');

        errorMsg.innerText = 'Đang đăng nhập...';
        errorMsg.style.color = '#999';

        try {
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

            if (!loginResponse.ok) {
                errorMsg.style.color = 'red';
                errorMsg.innerText = loginResult;
                return;
            }

            // Bước 2: Lấy danh sách users để tìm user_id
            const usersResponse = await fetch(`${API_URL}/users`);
            if (!usersResponse.ok) {
                throw new Error('Không thể lấy thông tin user');
            }

            const users = await usersResponse.json();

            // Bước 3: Tìm user vừa đăng nhập
            const currentUser = users.find(u =>
                (u.username === usernameOrEmail || u.email === usernameOrEmail)
            );

            if (!currentUser) {
                errorMsg.style.color = 'red';
                errorMsg.innerText = 'Không tìm thấy thông tin user!';
                return;
            }

            // Bước 4: Lưu vào localStorage với đầy đủ thông tin
            const userInfo = {
                user_id: currentUser.user_id,
                username: currentUser.username,
                email: currentUser.email,
                role: currentUser.role || 'user'
            };

            localStorage.setItem('currentUser', JSON.stringify(userInfo));

            console.log('✅ Đăng nhập thành công!');
            console.log('User info:', userInfo);

            // Bước 5: Chuyển hướng
            errorMsg.style.color = 'green';
            errorMsg.innerText = 'Đăng nhập thành công! Đang chuyển hướng...';

            setTimeout(() => {
                window.location.href = currentUser.role === 'admin' ? 'admin.html' : 'index.html';
            }, 1000);

        } catch (error) {
            console.error('❌ Login error:', error);
            errorMsg.style.color = 'red';
            errorMsg.innerText = 'Lỗi kết nối server! Đảm bảo backend đang chạy.';
        }
    });
}

// ========================================
// ĐĂNG KÝ - GỌI API BACKEND
// ========================================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newUsername = document.getElementById('newUsername').value.trim();
        const newEmail = document.getElementById('newEmail').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();
        const registerMsg = document.getElementById('registerMsg');

        // Validation
        if (!newUsername || !newEmail || !newPassword || !confirmPassword) {
            registerMsg.innerText = '⚠️ Vui lòng nhập đầy đủ thông tin.';
            registerMsg.style.color = 'red';
            return;
        }

        if (newPassword !== confirmPassword) {
            registerMsg.innerText = '⚠️ Mật khẩu xác nhận không khớp.';
            registerMsg.style.color = 'red';
            return;
        }

        registerMsg.innerText = 'Đang đăng ký...';
        registerMsg.style.color = '#999';

        try {
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

            if (!response.ok) {
                registerMsg.style.color = 'red';
                registerMsg.innerText = result;
                return;
            }

            registerMsg.style.color = 'green';
            registerMsg.innerText = 'Đăng ký thành công! Đang chuyển hướng...';

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);

        } catch (error) {
            console.error('❌ Register error:', error);
            registerMsg.style.color = 'red';
            registerMsg.innerText = 'Lỗi kết nối server!';
        }
    });
}

// ========================================
// QUÊN MẬT KHẨU
// ========================================
let currentResetEmail = '';
let currentResetCode = '';

// Chuyển đổi giữa các form
const showForgotPasswordBtn = document.getElementById('showForgotPassword');
const backToLoginBtn = document.getElementById('backToLogin');
const backToLoginFromVerifyBtn = document.getElementById('backToLoginFromVerify');

if (showForgotPasswordBtn) {
    showForgotPasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('forgotPasswordForm').style.display = 'flex';
    });
}

if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('forgotPasswordForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'flex';
    });
}

if (backToLoginFromVerifyBtn) {
    backToLoginFromVerifyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('verifyCodeForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'flex';
    });
}

// BƯỚC 1: GỬI EMAIL ĐỂ NHẬN MÃ
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('resetEmail').value.trim();
        const forgotMsg = document.getElementById('forgotMsg');

        if (!email) {
            forgotMsg.style.color = 'red';
            forgotMsg.innerText = 'Vui lòng nhập email!';
            return;
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
                return;
            }

            // Lưu email để dùng ở bước sau
            currentResetEmail = email;

            forgotMsg.style.color = 'green';
            forgotMsg.innerText = result;

            // Chuyển sang form xác thực code
            setTimeout(() => {
                document.getElementById('forgotPasswordForm').style.display = 'none';
                document.getElementById('verifyCodeForm').style.display = 'flex';
                startResendTimer(); // Bắt đầu đếm ngược
            }, 1500);

        } catch (error) {
            console.error('❌ Forgot password error:', error);
            forgotMsg.style.color = 'red';
            forgotMsg.innerText = 'Lỗi kết nối server!';
        }
    });
}

// BƯỚC 2: XÁC THỰC MÃ
const verifyCodeForm = document.getElementById('verifyCodeForm');
if (verifyCodeForm) {
    verifyCodeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const code = document.getElementById('verifyCode').value.trim();
        const verifyMsg = document.getElementById('verifyMsg');

        if (!code || code.length !== 6) {
            verifyMsg.style.color = 'red';
            verifyMsg.innerText = 'Vui lòng nhập mã 6 số!';
            return;
        }

        verifyMsg.innerText = 'Đang xác thực...';
        verifyMsg.style.color = '#999';

        try {
            const response = await fetch(`${API_URL}/users/verify-reset-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: currentResetEmail,
                    code: code
                })
            });

            const result = await response.text();

            if (!response.ok) {
                verifyMsg.style.color = 'red';
                verifyMsg.innerText = result;
                return;
            }

            // Lưu code để dùng ở bước cuối
            currentResetCode = code;

            verifyMsg.style.color = 'green';
            verifyMsg.innerText = result;

            // Chuyển sang form đặt lại mật khẩu
            setTimeout(() => {
                document.getElementById('verifyCodeForm').style.display = 'none';
                document.getElementById('resetPasswordForm').style.display = 'flex';
            }, 1000);

        } catch (error) {
            console.error('❌ Verify code error:', error);
            verifyMsg.style.color = 'red';
            verifyMsg.innerText = 'Lỗi kết nối server!';
        }
    });
}

// NÚT GỬI LẠI MÃ (60 giây)
let resendTimer = null;
function startResendTimer() {
    const resendBtn = document.getElementById('resendCodeBtn');
    let countdown = 60;

    resendBtn.disabled = true;
    resendBtn.innerText = `Gửi lại mã (${countdown}s)`;

    resendTimer = setInterval(() => {
        countdown--;
        resendBtn.innerText = `Gửi lại mã (${countdown}s)`;

        if (countdown <= 0) {
            clearInterval(resendTimer);
            resendBtn.disabled = false;
            resendBtn.innerText = 'Gửi lại mã';
        }
    }, 1000);
}

const resendCodeBtn = document.getElementById('resendCodeBtn');
if (resendCodeBtn) {
    resendCodeBtn.addEventListener('click', async () => {
        const verifyMsg = document.getElementById('verifyMsg');
        verifyMsg.innerText = 'Đang gửi lại mã...';
        verifyMsg.style.color = '#999';

        try {
            const response = await fetch(`${API_URL}/users/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentResetEmail })
            });

            const result = await response.text();

            if (!response.ok) {
                verifyMsg.style.color = 'red';
                verifyMsg.innerText = result;
                return;
            }

            verifyMsg.style.color = 'green';
            verifyMsg.innerText = 'Mã mới đã được gửi!';

            startResendTimer(); // Bắt đầu lại đếm ngược

        } catch (error) {
            console.error('❌ Resend code error:', error);
            verifyMsg.style.color = 'red';
            verifyMsg.innerText = 'Lỗi kết nối server!';
        }
    });
}

// BƯỚC 3: ĐẶT LẠI MẬT KHẨU
const resetPasswordForm = document.getElementById('resetPasswordForm');
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPassword = document.getElementById('newPassword').value.trim();
        const confirmNewPassword = document.getElementById('confirmNewPassword').value.trim();
        const resetMsg = document.getElementById('resetMsg');

        if (!newPassword || !confirmNewPassword) {
            resetMsg.style.color = 'red';
            resetMsg.innerText = 'Vui lòng nhập đầy đủ thông tin!';
            return;
        }

        if (newPassword !== confirmNewPassword) {
            resetMsg.style.color = 'red';
            resetMsg.innerText = 'Mật khẩu xác nhận không khớp!';
            return;
        }

        resetMsg.innerText = 'Đang đổi mật khẩu...';
        resetMsg.style.color = '#999';

        try {
            const response = await fetch(`${API_URL}/users/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: currentResetEmail,
                    code: currentResetCode,
                    newPassword: newPassword,
                    confirmPassword: confirmNewPassword
                })
            });

            const result = await response.text();

            if (!response.ok) {
                resetMsg.style.color = 'red';
                resetMsg.innerText = result;
                return;
            }

            resetMsg.style.color = 'green';
            resetMsg.innerText = 'Đặt lại mật khẩu thành công! Đang chuyển hướng...';

            // Chuyển về trang đăng nhập
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('❌ Reset password error:', error);
            resetMsg.style.color = 'red';
            resetMsg.innerText = 'Lỗi kết nối server!';
        }
    });
}

// ========================================
// ĐĂNG XUẤT
// ========================================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        console.log('✅ Đã đăng xuất');
        window.location.href = 'login.html';
    });
}

// ========================================
// KIỂM TRA ĐĂNG NHẬP KHI VÀO INDEX.HTML
// ========================================
if (window.location.pathname.includes('index.html')) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    console.log('=== CHECK LOGIN STATUS ===');
    console.log('Current user:', currentUser);

    if (!currentUser || !currentUser.user_id) {
        console.log('❌ Chưa đăng nhập, redirect về login');
        alert('Vui lòng đăng nhập trước!');
        window.location.href = 'login.html';
    } else {
        console.log('✅ Đã đăng nhập, user_id:', currentUser.user_id);
    }
}

// ========================================
// DEBUG INFO
// ========================================
console.log('=== AUTH.JS LOADED ===');
console.log('API URL:', API_URL);
console.log('localStorage currentUser:', localStorage.getItem('currentUser'));