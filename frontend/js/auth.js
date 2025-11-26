// Khởi tạo danh sách người dùng mặc định
let defaultUsers = [
  { username: 'admin', email: 'admin@gmail.com', password: '123', role: 'admin' },
  { username: 'user', email: 'user@gmail.com', password: '123', role: 'user' }
];

// Lấy danh sách user trong localStorage hoặc dùng mặc định
let users = JSON.parse(localStorage.getItem('users')) || defaultUsers;

// Chỉ ghi lại vào localStorage nếu đang dùng mặc định ban đầu HOẶC cần cập nhật cấu trúc
if (!localStorage.getItem('users')) {
  localStorage.setItem('users', JSON.stringify(users));
}

// ---- XỬ LÝ ĐĂNG NHẬP ----
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const usernameOrEmail = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Tìm người dùng qua username hoặc email
    const user = users.find(u => 
      (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password);

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
    const newEmail = document.getElementById('newEmail').value.trim(); // Lấy giá trị Email
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const registerMsg = document.getElementById('registerMsg');

    // Kiểm tra rỗng
    if (!newUsername || !newEmail || !newPassword || !confirmPassword) {
      registerMsg.innerText = '⚠️ Vui lòng nhập đầy đủ thông tin.';
      registerMsg.style.color = 'red';
      return;
    }
    
    // Ràng buộc mật khẩu: Tối thiểu 8 ký tự, gồm cả chữ hoa, chữ thường và số
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    
    if (!passwordRegex.test(newPassword)) {
      registerMsg.innerText = '⚠️ Mật khẩu phải ≥8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.';
      registerMsg.style.color = 'red';
      return;
    }

    // Xác nhận mật khẩu
    if (newPassword !== confirmPassword) {
      registerMsg.innerText = '⚠️ Mật khẩu xác nhận không khớp.';
      registerMsg.style.color = 'red';
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Kiểm tra tên đăng nhập hoặc email đã tồn tại
    const exists = users.some(u => u.username === newUsername || u.email === newEmail);
    if (exists) return registerMsg.innerText = 'Tên đăng nhập hoặc Email đã tồn tại';

    // Thêm email vào đối tượng người dùng mới
    users.push({ username: newUsername, email: newEmail, password: newPassword, role: 'user' });
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
