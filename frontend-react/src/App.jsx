import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';

// Protected Route Component - Kiểm tra đăng nhập và quyền truy cập
const ProtectedRoute = ({ children, role }) => {
  const userRole = localStorage.getItem('userRole');
  const token = localStorage.getItem('token');
  const currentUser = localStorage.getItem('currentUser');

  // Chưa đăng nhập (không có token hoặc userRole)
  if (!userRole || !token || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra quyền admin
  if (role && userRole !== role) {
    // Nếu user cố truy cập trang admin nhưng không phải admin
    if (role === 'ADMIN' && userRole !== 'ADMIN') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// Component redirect nếu đã đăng nhập
const PublicRoute = ({ children }) => {
  const currentUser = localStorage.getItem('currentUser');
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // Nếu đã đăng nhập, redirect dựa trên role
  if (currentUser && token && userRole) {
    if (userRole === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes - redirect đến dashboard nếu đã đăng nhập */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />

        {/* Protected routes - yêu cầu đăng nhập */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Admin route - yêu cầu quyền ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch all - redirect về login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
