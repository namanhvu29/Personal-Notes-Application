// API URL
const API_URL = 'http://localhost:8080/foundation';

// ========================================
// HELPER: GET AUTH HEADERS
// ========================================
function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

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

            if (!loginResponse.ok) {
                const errorText = await loginResponse.text();
                errorMsg.style.color = 'red';
                errorMsg.innerText = errorText || 'Đăng nhập thất bại!';
                return;
            }

            const data = await loginResponse.json();

            // Bước 2: Lưu token và thông tin user
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('currentUser', JSON.stringify({
                user_id: data.user_id,
                username: data.username,
                email: data.email,
                role: data.role
            }));

            console.log('✅ Đăng nhập thành công!');
            console.log('Token:', data.accessToken);

            // Bước 3: Chuyển hướng
            errorMsg.style.color = 'green';
            errorMsg.innerText = 'Đăng nhập thành công! Đang chuyển hướng...';

            setTimeout(() => {
                if (data.role === 'ADMIN') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }
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
// ĐĂNG XUẤT
// ========================================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('accessToken');
        console.log('✅ Đã đăng xuất');
        window.location.href = 'login.html';
    });
}

// ========================================
// KIỂM TRA ĐĂNG NHẬP KHI VÀO INDEX.HTML
// ========================================
if (window.location.pathname.includes('index.html')) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const token = localStorage.getItem('accessToken');

    console.log('=== CHECK LOGIN STATUS ===');

    if (!currentUser || !token) {
        console.log('❌ Chưa đăng nhập, redirect về login');
        alert('Vui lòng đăng nhập trước!');
        window.location.href = 'login.html';
    } else {
        console.log('✅ Đã đăng nhập, user:', currentUser.username);
    }
}

// ========================================
// DEBUG INFO
// ========================================
console.log('=== AUTH.JS LOADED ===');
console.log('API URL:', API_URL);