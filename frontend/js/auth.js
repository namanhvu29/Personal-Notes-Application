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

// ---- ĐĂNG XUẤT ----
const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
if (currentUser && !window.location.href.includes('login.html') && !window.location.href.includes('register.html')) {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.onclick = ('logoutBtn') => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  };
}

// ========================================
// DEBUG INFO
// ========================================
console.log('=== AUTH.JS LOADED ===');
console.log('API URL:', API_URL);
console.log('localStorage currentUser:', localStorage.getItem('currentUser'));