import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';

// Component kiểm tra đăng nhập
const PrivateRoute = ({ children }) => {
  const currentUser = localStorage.getItem('currentUser');
  const token = localStorage.getItem('token');

  // Kiểm tra xem user đã đăng nhập chưa
  if (!currentUser || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Component redirect nếu đã đăng nhập
const PublicRoute = ({ children }) => {
  const currentUser = localStorage.getItem('currentUser');
  const token = localStorage.getItem('token');

  // Nếu đã đăng nhập, redirect đến dashboard
  if (currentUser && token) {
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
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute>
            <AdminPage />
          </PrivateRoute>
        } />

        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch all - redirect về dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
