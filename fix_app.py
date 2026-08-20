import os
content = r'''import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Media from './pages/Media';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path='/signup' element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
          <Route path='/' element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path='/dashboard' element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path='/editor' element={<ProtectedRoute><MainLayout><Editor /></MainLayout></ProtectedRoute>} />
          <Route path='/media' element={<ProtectedRoute><MainLayout><Media /></MainLayout></ProtectedRoute>} />
          <Route path='*' element={<Navigate to='/dashboard' replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;
'''
with open(r'D:\AI TRADER\Reel maker\src\App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
