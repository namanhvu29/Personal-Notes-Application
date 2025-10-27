// Khởi tạo danh sách người dùng mặc định
let defaultUsers = [
  { username: 'admin', password: '123', role: 'admin' },
  { username: 'user', password: '123', role: 'user' }
];

// Lấy danh sách user trong localStorage hoặc dùng mặc định
let users = JSON.parse(localStorage.getItem('users')) || defaultUsers;
localStorage.setItem('users', JSON.stringify(users));

// ---- XỬ LÝ ĐĂNG NHẬP ----
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) return document.getElementById('errorMsg').innerText = 'Sai thông tin đăng nhập';
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = user.role === 'admin' ? 'admin.html' : 'index.html';
  });
}

// ---- XỬ LÝ ĐĂNG KÝ ----
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const newUsername = document.getElementById('newUsername').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const registerMsg = document.getElementById('registerMsg');

    if (!newUsername || !newPassword || !confirmPassword)
      return registerMsg.innerText = 'Vui lòng nhập đầy đủ thông tin';
    
    // Ràng buộc mật khẩu: Tối thiểu 8 ký tự, gồm cả chữ hoa, chữ thường và số
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(newPassword))
      return registerMsg.innerText = 'Mật khẩu phải tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số';
    
    if (newPassword !== confirmPassword)
      return registerMsg.innerText = 'Mật khẩu xác nhận không khớp';

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const exists = users.some(u => u.username === newUsername);
    if (exists) return registerMsg.innerText = 'Tên đăng nhập đã tồn tại';

    users.push({ username: newUsername, password: newPassword, role: 'user' });
    localStorage.setItem('users', JSON.stringify(users));
    registerMsg.style.color = 'green';
    registerMsg.innerText = 'Đăng ký thành công! Chuyển hướng...';
    
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  });
}

// ---- ĐĂNG XUẤT ----
const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
if (currentUser && !window.location.href.includes('login.html') && !window.location.href.includes('register.html')) {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.onclick = () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  };
}
