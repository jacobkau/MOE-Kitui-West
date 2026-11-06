import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Schools from './pages/Schools';
import Collections from './pages/Collections';
import Submissions from './pages/Submissions';
import PublicForm from './pages/PublicForm';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/form/:slug" element={<PublicForm />} />

      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/schools" element={<ProtectedRoute><Schools /></ProtectedRoute>} />
      <Route path="/collections" element={<ProtectedRoute><Collections /></ProtectedRoute>} />
      <Route path="/submissions/:collectionId" element={<ProtectedRoute><Submissions /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
