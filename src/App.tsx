import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Media from './pages/Media';
import { CreateContent } from './pages/CreateContent';
import Businesses from './pages/Businesses';
import Content from './pages/Content';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path='/signup' element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
          <Route path='/' element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path='/dashboard' element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path='/create' element={<ProtectedRoute><MainLayout><CreateContent /></MainLayout></ProtectedRoute>} />
          <Route path='/editor' element={<ProtectedRoute><MainLayout><Editor /></MainLayout></ProtectedRoute>} />
          <Route path='/media' element={<ProtectedRoute><MainLayout><Media /></MainLayout></ProtectedRoute>} />
          <Route path='/businesses' element={<ProtectedRoute><MainLayout><Businesses /></MainLayout></ProtectedRoute>} />
          <Route path='/content' element={<ProtectedRoute><MainLayout><Content /></MainLayout></ProtectedRoute>} />
          <Route path='/analytics' element={<ProtectedRoute><MainLayout><Analytics /></MainLayout></ProtectedRoute>} />
          <Route path='/settings' element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
          <Route path='*' element={<Navigate to='/dashboard' replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;
