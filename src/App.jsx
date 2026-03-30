import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';

const App = () => (
  <AuthProvider>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1E293B',
          color: '#F8FAFC',
          borderRadius: '12px',
          border: '1px solid rgba(59,130,246,0.2)',
        },
      }}
    />
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/profile/me" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
