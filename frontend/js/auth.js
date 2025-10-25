const users = [
    { username: 'admin', password: '123', role: 'admin' },
    { username: 'user', password: '123', role: 'user' }
  ];
  
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const user = users.find(u => u.username === username && u.password === password);
      if (!user) return document.getElementById('errorMsg').innerText = 'Sai thông tin đăng nhập';
      localStorage.setItem('currentUser', JSON.stringify(user));
      window.location.href = user.role === 'admin' ? 'admin.html' : 'index.html';
    });
  }
  
  // kiểm tra đăng nhập ở các trang khác
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (currentUser && !window.location.href.includes('login.html')) {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.onclick = () => {
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    };
  }
  